<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSharedLinkRequest;
use App\Http\Resources\SharedLinkResource;
use App\Models\SharedLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class SharedLinkController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $links = SharedLink::query()
            ->with('application')
            ->orderByDesc('created_at')
            ->get();

        return SharedLinkResource::collection($links);
    }

    public function store(StoreSharedLinkRequest $request): SharedLinkResource
    {
        $data = $request->validated();

        $link = SharedLink::create([
            'application_id' => $data['application_id'],
            'token' => Str::random(48),
            'expires_at' => $data['expires_at'] ?? null,
            'max_downloads' => $data['max_downloads'] ?? null,
            'active' => $data['active'] ?? true,
        ]);

        return new SharedLinkResource($link->load('application'));
    }

    public function toggleActive(SharedLink $sharedLink): SharedLinkResource
    {
        $sharedLink->update(['active' => ! $sharedLink->active]);

        return new SharedLinkResource($sharedLink->fresh()->load('application'));
    }

    public function destroy(SharedLink $sharedLink): JsonResponse
    {
        $sharedLink->delete();

        return response()->json(['message' => 'Enlace eliminado.']);
    }
}
