<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Http\Requests\UpdateApplicationVersionRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\ApplicationVersionResource;
use App\Models\Application;
use App\Models\ApplicationVersion;
use App\Services\ApplicationVersionHistory;
use App\Services\InstallerStorage;
use App\Support\SlugGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ApplicationController extends Controller
{
    public function __construct(
        protected InstallerStorage $installerStorage,
        protected ApplicationVersionHistory $versionHistory
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Application::query()->with('category')->withCount('versions');

        if ($request->filled('search')) {
            $search = $request->search;
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                    ->orWhere('version', $operator, "%{$search}%")
                    ->orWhere('slug', $operator, "%{$search}%")
                    ->orWhere('file_name', $operator, "%{$search}%")
                    ->orWhere('os', $operator, "%{$search}%")
                    ->orWhere('description', $operator, "%{$search}%")
                    ->orWhereHas('category', fn ($c) => $c->where('name', $operator, "%{$search}%"));
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('active')) {
            $query->where('active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderByDesc('updated_at');

        if ($request->boolean('all')) {
            return ApplicationResource::collection($query->get());
        }

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        return ApplicationResource::collection($query->paginate($perPage));
    }

    public function store(StoreApplicationRequest $request): ApplicationResource
    {
        $data = $request->validated();
        $fileMeta = $this->installerStorage->store($request->file('file'));

        $application = Application::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'slug' => SlugGenerator::unique($data['name'], Application::class),
            'version' => $data['version'],
            'description' => $data['description'] ?? null,
            'instructions' => $data['instructions'] ?? null,
            'os' => $data['os'] ?? null,
            'architecture' => $data['architecture'] ?? null,
            'requires_admin' => $request->boolean('requires_admin'),
            'active' => $request->boolean('active', true),
            'visible_in_catalog' => $request->boolean('visible_in_catalog', true),
            'requires_download_password' => $request->boolean('requires_download_password'),
            'download_password_hash' => $this->hashDownloadPassword($request),
            'keep_version_history' => $request->boolean('keep_version_history'),
            'max_versions_to_keep' => $this->versionHistory->clampMaxVersions(
                (int) $request->input('max_versions_to_keep', config('repositorio.default_max_versions'))
            ),
            ...$fileMeta,
        ]);

        return new ApplicationResource($application->load('category')->loadCount('versions'));
    }

    public function show(Application $application): ApplicationResource
    {
        return new ApplicationResource($application->load('category')->loadCount('versions'));
    }

    public function update(UpdateApplicationRequest $request, Application $application): ApplicationResource
    {
        $data = $request->validated();

        if (isset($data['name']) && $data['name'] !== $application->name) {
            $data['slug'] = SlugGenerator::unique($data['name'], Application::class, $application->id);
        }

        if ($request->has('keep_version_history')) {
            $data['keep_version_history'] = $request->boolean('keep_version_history');
        }
        if ($request->has('max_versions_to_keep')) {
            $data['max_versions_to_keep'] = $this->versionHistory->clampMaxVersions(
                (int) $request->input('max_versions_to_keep')
            );
        }

        if ($request->hasFile('file')) {
            $keepPrevious = $data['keep_version_history'] ?? $application->keep_version_history;
            $maxVersions = $this->versionHistory->clampMaxVersions(
                $data['max_versions_to_keep'] ?? $application->max_versions_to_keep
            );

            if ($keepPrevious) {
                $this->versionHistory->archiveCurrent($application);
                $this->versionHistory->prune($application, $maxVersions);
            } else {
                $this->installerStorage->delete($application->file_path);
            }

            $fileMeta = $this->installerStorage->store($request->file('file'));
            $data = array_merge($data, $fileMeta);
        }

        unset($data['file'], $data['download_password']);
        if ($request->has('requires_admin')) {
            $data['requires_admin'] = $request->boolean('requires_admin');
        }
        if ($request->has('active')) {
            $data['active'] = $request->boolean('active');
        }
        if ($request->has('visible_in_catalog')) {
            $data['visible_in_catalog'] = $request->boolean('visible_in_catalog');
        }
        if ($request->has('requires_download_password')) {
            $data['requires_download_password'] = $request->boolean('requires_download_password');
            if (! $data['requires_download_password']) {
                $data['download_password_hash'] = null;
            }
        }
        $passwordHash = $this->hashDownloadPassword($request, $application);
        if ($passwordHash !== null) {
            $data['download_password_hash'] = $passwordHash;
        }
        $application->update($data);

        return new ApplicationResource($application->fresh()->load('category')->loadCount('versions'));
    }

    public function versions(Application $application): AnonymousResourceCollection|JsonResponse
    {
        if (! $application->keep_version_history) {
            return response()->json([
                'message' => 'Esta aplicación no conserva versiones anteriores.',
            ], 403);
        }

        return ApplicationVersionResource::collection(
            $application->versions()->orderByDesc('archived_at')->get()
        );
    }

    public function downloadVersion(Application $application, ApplicationVersion $version): BinaryFileResponse|JsonResponse
    {
        if ($version->application_id !== $application->id) {
            abort(404);
        }

        if (! $application->keep_version_history) {
            return response()->json([
                'message' => 'Esta aplicación no conserva versiones anteriores.',
            ], 403);
        }

        if (! $this->installerStorage->exists($version->file_path)) {
            abort(404, 'El archivo archivado no existe en el servidor.');
        }

        $path = $this->installerStorage->fullPath($version->file_path);

        return response()->download($path, $version->file_name, [
            'Content-Type' => $version->mime_type ?? 'application/octet-stream',
        ]);
    }

    public function destroyVersion(Application $application, ApplicationVersion $version): JsonResponse
    {
        if ($version->application_id !== $application->id) {
            abort(404);
        }

        if (! $application->keep_version_history) {
            return response()->json([
                'message' => 'Esta aplicación no conserva versiones anteriores.',
            ], 403);
        }

        $this->versionHistory->deleteVersion($version);

        return response()->json(['message' => 'Versión archivada eliminada.']);
    }

    public function destroy(Application $application): JsonResponse
    {
        $this->versionHistory->deleteAllFor($application);
        $this->installerStorage->delete($application->file_path);
        $application->delete();

        return response()->json(['message' => 'Aplicación eliminada.']);
    }

    public function toggleActive(Application $application): ApplicationResource
    {
        $application->update(['active' => ! $application->active]);

        return new ApplicationResource($application->fresh()->load('category'));
    }

    public function updateVersion(UpdateApplicationVersionRequest $request, Application $application): ApplicationResource
    {
        $application->update([
            'version' => $request->validated('version'),
        ]);

        return new ApplicationResource($application->fresh()->load('category'));
    }

    protected function hashDownloadPassword(Request $request, ?Application $existing = null): ?string
    {
        $requires = $request->has('requires_download_password')
            ? $request->boolean('requires_download_password')
            : ($existing?->requires_download_password ?? false);

        if (! $requires) {
            return null;
        }

        $plain = $request->input('download_password');
        if (! is_string($plain) || $plain === '') {
            return null;
        }

        return Hash::make($plain);
    }
}
