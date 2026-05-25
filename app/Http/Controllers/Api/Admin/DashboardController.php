<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DownloadLogResource;
use App\Models\Application;
use App\Models\Category;
use App\Models\DownloadLog;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $recentDownloads = DownloadLog::query()
            ->with('application')
            ->orderByDesc('downloaded_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_applications' => Application::count(),
                'active_applications' => Application::where('active', true)->count(),
                'total_categories' => Category::count(),
                'total_downloads' => DownloadLog::count(),
            ],
            'recent_downloads' => DownloadLogResource::collection($recentDownloads),
        ]);
    }
}
