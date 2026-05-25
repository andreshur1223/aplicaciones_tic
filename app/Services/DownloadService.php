<?php

namespace App\Services;

use App\Models\Application;
use App\Models\DownloadLog;
use App\Models\SharedLink;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadService
{
    public function __construct(
        protected InstallerStorage $storage,
        protected ApplicationDownloadAccess $downloadAccess
    ) {}

    public function downloadApplication(Application $application, Request $request): BinaryFileResponse
    {
        $this->assertApplicationDownloadable($application, $request);
        $this->recordDownload($application, $request);

        return $this->streamFile($application);
    }

    public function downloadViaSharedLink(SharedLink $link, Request $request): BinaryFileResponse
    {
        if (! $link->canDownload()) {
            abort(403, 'El enlace compartido no está disponible.');
        }

        $application = $link->application;
        $this->assertApplicationDownloadable($application, $request);
        $this->recordDownload($application, $request);
        $link->increment('current_downloads');

        return $this->streamFile($application);
    }

    protected function assertApplicationDownloadable(Application $application, Request $request, bool $bypassPassword = false): void
    {
        if (! $application->active) {
            abort(403, 'La aplicación no está disponible.');
        }

        if (! $bypassPassword) {
            $this->downloadAccess->assertUnlocked($application, $request);
        }

        if (! $this->storage->exists($application->file_path)) {
            abort(404, 'El archivo no existe en el servidor.');
        }
    }

    protected function recordDownload(Application $application, Request $request): void
    {
        DownloadLog::create([
            'application_id' => $application->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'downloaded_at' => now(),
        ]);

        $application->increment('download_count');
    }

    protected function streamFile(Application $application): BinaryFileResponse
    {
        $path = $this->storage->fullPath($application->file_path);

        return response()->download($path, $application->file_name, [
            'Content-Type' => $application->mime_type ?? 'application/octet-stream',
        ]);
    }
}
