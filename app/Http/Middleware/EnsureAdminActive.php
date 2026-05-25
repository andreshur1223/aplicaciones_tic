<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->active || ! $user->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 401);
        }

        return $next($request);
    }
}
