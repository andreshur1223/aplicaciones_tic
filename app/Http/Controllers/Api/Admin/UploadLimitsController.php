<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\UploadLimits;
use Illuminate\Http\JsonResponse;

class UploadLimitsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => UploadLimits::summary()]);
    }
}
