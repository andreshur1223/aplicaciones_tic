<?php

namespace App\Support;

use Laravel\Sanctum\Sanctum;

class SanctumStatefulDomains
{
    /**
     * Dominios que reciben cookies de sesión en rutas API (SPA).
     * Usa APP_URL y el host de la petición actual para evitar 401 en intranet.
     *
     * @return list<string>
     */
    public static function resolve(): array
    {
        $domains = [];

        $env = (string) config('sanctum.stateful_domains', '');
        if (is_string($env) && $env !== '') {
            $domains = array_map('trim', explode(',', $env));
        }

        foreach ([config('app.url'), config('app.asset_url')] as $url) {
            if (! $url) {
                continue;
            }
            $host = parse_url($url, PHP_URL_HOST);
            $port = parse_url($url, PHP_URL_PORT);
            if ($host) {
                $domains[] = $host;
                if ($port) {
                    $domains[] = "{$host}:{$port}";
                }
            }
        }

        $domains[] = Sanctum::$currentRequestHostPlaceholder;

        if (app()->environment('local')) {
            $domains = array_merge($domains, [
                'localhost',
                'localhost:3000',
                '127.0.0.1',
                '127.0.0.1:8000',
                '::1',
            ]);
        }

        return array_values(array_unique(array_filter($domains)));
    }
}
