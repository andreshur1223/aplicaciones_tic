<?php

namespace App\Providers;

use App\Support\SanctumStatefulDomains;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        config(['sanctum.stateful' => SanctumStatefulDomains::resolve()]);

        if ($url = config('app.url')) {
            URL::forceRootUrl($url);

            if (str_starts_with($url, 'https://')) {
                URL::forceScheme('https');
            }
        }
    }
}
