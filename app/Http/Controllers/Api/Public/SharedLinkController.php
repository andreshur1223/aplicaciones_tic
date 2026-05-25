<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\SharedLink;
use App\Services\ApplicationDownloadAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SharedLinkController extends Controller
{
    public function __construct(
        protected ApplicationDownloadAccess $downloadAccess
    ) {}

    public function show(string $token): JsonResponse
    {
        $link = SharedLink::query()
            ->with('application.category')
            ->where('token', $token)
            ->firstOrFail();

        $application = $link->application;

        return response()->json([
            'data' => [
                'token' => $link->token,
                'share_url' => url('/share/'.$link->token),
                'download_url' => url('/share/'.$link->token.'/download'),
                'expires_at' => $link->expires_at,
                'max_downloads' => $link->max_downloads,
                'current_downloads' => $link->current_downloads,
                'active' => $link->active,
                'can_download' => $link->canDownload(),
                'unavailable_reason' => $link->unavailableReason(),
                'application' => $application
                    ? new ApplicationResource($application)
                    : null,
            ],
        ]);
    }

    public function unlockDownload(string $token, Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'max:100'],
        ]);

        $link = SharedLink::query()
            ->with('application')
            ->where('token', $token)
            ->firstOrFail();

        if (! $link->canDownload()) {
            return response()->json([
                'message' => $link->unavailableReason() ?? 'Este enlace no está disponible.',
            ], 403);
        }

        $application = $link->application;
        if (! $application) {
            return response()->json(['message' => 'Aplicación no encontrada.'], 404);
        }

        if (! $application->requires_download_password) {
            return response()->json(['message' => 'Esta aplicación no requiere contraseña.']);
        }

        if (! $this->downloadAccess->verifyAndUnlock($application, $request->input('password'), $request)) {
            return response()->json(['message' => 'Contraseña incorrecta.'], 422);
        }

        return response()->json(['message' => 'Contraseña correcta. Ya puede descargar.']);
    }
}
