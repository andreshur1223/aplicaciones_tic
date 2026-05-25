<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\SharedLink;
use App\Services\DownloadService;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function __construct(
        protected DownloadService $downloadService
    ) {}

    public function bySlug(string $slug, Request $request)
    {
        $application = Application::where('slug', $slug)->firstOrFail();

        return $this->downloadService->downloadApplication($application, $request);
    }

    public function byToken(string $token, Request $request)
    {
        $link = SharedLink::where('token', $token)->firstOrFail();

        return $this->downloadService->downloadViaSharedLink($link, $request);
    }
}
