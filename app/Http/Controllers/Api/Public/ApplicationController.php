<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\ApplicationDownloadAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    public function __construct(
        protected ApplicationDownloadAccess $downloadAccess
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Application::query()
            ->with('category')
            ->where('active', true)
            ->where('visible_in_catalog', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                    ->orWhere('description', $operator, "%{$search}%");
            });
        }

        $query->orderByDesc('updated_at');

        if ($request->boolean('all')) {
            return ApplicationResource::collection($query->get());
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 50);

        return ApplicationResource::collection($query->paginate($perPage));
    }

    public function show(string $slug): ApplicationResource
    {
        $application = Application::query()
            ->with('category')
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return new ApplicationResource($application);
    }

    public function unlockDownload(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'max:100'],
        ]);

        $application = Application::query()
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        if (! $application->requires_download_password) {
            return response()->json(['message' => 'Esta aplicación no requiere contraseña.']);
        }

        if (! $this->downloadAccess->verifyAndUnlock($application, $request->input('password'), $request)) {
            return response()->json(['message' => 'Contraseña incorrecta.'], 422);
        }

        return response()->json(['message' => 'Contraseña correcta. Ya puede descargar.']);
    }
}
