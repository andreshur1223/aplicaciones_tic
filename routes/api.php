<?php

use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DownloadLogController;
use App\Http\Controllers\Api\Admin\SharedLinkController;
use App\Http\Controllers\Api\Admin\UploadLimitsController;
use App\Http\Controllers\Api\Public\ApplicationController;
use App\Http\Controllers\Api\Public\CategoryController;
use App\Http\Controllers\Api\Public\SharedLinkController as PublicSharedLinkController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->group(function () {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('applications', [ApplicationController::class, 'index']);
    Route::get('applications/{slug}', [ApplicationController::class, 'show']);
    Route::post('applications/{slug}/unlock-download', [ApplicationController::class, 'unlockDownload']);
    Route::get('share/{token}', [PublicSharedLinkController::class, 'show']);
    Route::post('share/{token}/unlock-download', [PublicSharedLinkController::class, 'unlockDownload']);
});

Route::prefix('admin')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:web', 'admin.active'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('upload-limits', [UploadLimitsController::class, 'show']);

        Route::apiResource('categories', AdminCategoryController::class);
        Route::patch('categories/{category}/toggle-active', [AdminCategoryController::class, 'toggleActive']);

        Route::get('applications', [AdminApplicationController::class, 'index']);
        Route::post('applications', [AdminApplicationController::class, 'store']);
        Route::get('applications/{application}', [AdminApplicationController::class, 'show']);
        Route::get('applications/{application}/versions', [AdminApplicationController::class, 'versions']);
        Route::get('applications/{application}/versions/{version}/download', [AdminApplicationController::class, 'downloadVersion']);
        Route::delete('applications/{application}/versions/{version}', [AdminApplicationController::class, 'destroyVersion']);
        Route::match(['put', 'post'], 'applications/{application}', [AdminApplicationController::class, 'update']);
        Route::delete('applications/{application}', [AdminApplicationController::class, 'destroy']);
        Route::patch('applications/{application}/toggle-active', [AdminApplicationController::class, 'toggleActive']);
        Route::patch('applications/{application}/version', [AdminApplicationController::class, 'updateVersion']);

        Route::get('download-logs', [DownloadLogController::class, 'index']);

        Route::get('shared-links', [SharedLinkController::class, 'index']);
        Route::post('shared-links', [SharedLinkController::class, 'store']);
        Route::patch('shared-links/{sharedLink}/toggle-active', [SharedLinkController::class, 'toggleActive']);
        Route::delete('shared-links/{sharedLink}', [SharedLinkController::class, 'destroy']);
    });
});
