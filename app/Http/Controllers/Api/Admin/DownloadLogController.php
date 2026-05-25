<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DownloadLogResource;
use App\Models\DownloadLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DownloadLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = DownloadLog::query()->with('application');

        if ($request->filled('application_id')) {
            $query->where('application_id', $request->application_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('downloaded_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('downloaded_at', '<=', $request->date_to);
        }

        $logs = $query->orderByDesc('downloaded_at')->paginate(50);

        return DownloadLogResource::collection($logs);
    }
}
