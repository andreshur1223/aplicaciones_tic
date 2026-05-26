<?php

use App\Http\Middleware\EnsureAdminActive;
use App\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumEnsureFrontendRequestsAreStateful;
use App\Support\UploadLimits;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        $middleware->replaceInGroup(
            'api',
            SanctumEnsureFrontendRequestsAreStateful::class,
            EnsureFrontendRequestsAreStateful::class,
        );
        $middleware->alias([
            'admin.active' => EnsureAdminActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            $limits = UploadLimits::summary();

            return response()->json([
                'message' => 'El archivo es demasiado grande para el servidor (HTTP 413). '
                    .'Límite efectivo actual: '.$limits['effective_max_human']
                    .' (PHP post_max_size='.$limits['php_post_max_size']
                    .', upload_max_filesize='.$limits['php_upload_max_filesize'].').',
                'hint' => 'Aumente upload_max_filesize y post_max_size en php.ini (post_max_size debe ser igual o mayor que upload_max_filesize) y reinicie Apache o php artisan serve.',
                'limits' => $limits,
            ], 413);
        });
    })->create();
