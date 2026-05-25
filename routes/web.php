<?php

use App\Http\Controllers\DownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/download/{slug}', [DownloadController::class, 'bySlug'])->name('download.slug');
Route::get('/share/{token}/download', [DownloadController::class, 'byToken'])->name('download.share');

Route::view('/{any?}', 'app')->where('any', '.*');
