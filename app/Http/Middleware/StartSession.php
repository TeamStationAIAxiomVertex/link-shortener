<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Session\Middleware\StartSession as BaseStartSession;
use Illuminate\Support\Arr;

class StartSession extends BaseStartSession {
    public function handle($request, Closure $next) {
        $response = parent::handle($request, $next);

        if ($this->sessionConfigured() && ! $this->usingCookieSessions()) {
            $this->manager->driver()->save();
        }

        return $response;
    }

    protected function getCookieExpirationDate() {
        $config = $this->manager->getSessionConfig();

        if ($config['expire_on_close']) {
            return 0;
        }

        return time() + (Arr::get($config, 'lifetime') * 60);
    }
}
