<?php

namespace App\Http\Middleware;

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumMiddleware;

class EnsureFrontendRequestsAreStateful extends SanctumMiddleware
{
    /**
     * Sanctum solo activa sesión si Referer/Origin coinciden con sanctum.stateful.
     * En intranet el Referer a veces no llega; aceptamos XHR al mismo host que APP_URL.
     */
    public static function fromFrontend($request): bool
    {
        if (parent::fromFrontend($request)) {
            return true;
        }

        if ($request->headers->get('X-Requested-With') !== 'XMLHttpRequest') {
            return false;
        }

        $appUrl = config('app.url');
        if (! $appUrl) {
            return false;
        }

        $appHost = parse_url($appUrl, PHP_URL_HOST);
        if (! $appHost || $request->getHost() !== $appHost) {
            return false;
        }

        $appPort = parse_url($appUrl, PHP_URL_PORT);
        if ($appPort && (int) $request->getPort() !== (int) $appPort) {
            return false;
        }

        return true;
    }
}
