<?php

namespace App\Services;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ApplicationDownloadAccess
{
    public function verifyAndUnlock(Application $application, string $password, Request $request): bool
    {
        if (! $application->requires_download_password) {
            return true;
        }

        if (! $application->download_password_hash || ! Hash::check($password, $application->download_password_hash)) {
            return false;
        }

        $this->unlock($application, $request);

        return true;
    }

    public function unlock(Application $application, Request $request): void
    {
        $request->session()->put($this->sessionKey($application), true);
    }

    public function isUnlocked(Application $application, Request $request): bool
    {
        if (! $application->requires_download_password) {
            return true;
        }

        return $request->session()->get($this->sessionKey($application)) === true;
    }

    public function assertUnlocked(Application $application, Request $request): void
    {
        if ($this->isUnlocked($application, $request)) {
            return;
        }

        abort(403, 'Se requiere contraseña para descargar esta aplicación.');
    }

    protected function sessionKey(Application $application): string
    {
        return 'download_unlocked.'.$application->id;
    }
}
