<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log initial state
        Log::debug('SetLocale middleware - Initial state', [
            'path' => $request->path(),
            'cookie' => $request->cookie('locale'),
            'session' => $request->session()->get('locale'),
            'current_locale' => app()->getLocale(),
            'isStatsPage' => str_contains($request->path(), '/links/stats')
        ]);

        // Get locale from cookie first
        $locale = $request->cookie('locale');

        // If no cookie, check session
        if (!$locale) {
            $locale = $request->session()->get('locale');
        }

        // If no session, check browser preference
        if (!$locale) {
            $locale = $request->getPreferredLanguage(['en', 'fr']);
        }

        // Validate locale
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'en';
            Log::warning('Invalid locale detected, defaulting to English', [
                'original_locale' => $locale,
                'path' => $request->path()
            ]);
        }

        // Set the application locale
        app()->setLocale($locale);

        // Store in session if not already set
        if (!$request->session()->has('locale')) {
            $request->session()->put('locale', $locale);
        }

        // Set cookie if not already set
        if (!$request->cookie('locale')) {
            $response = $next($request);
            return $response->withCookie(cookie('locale', $locale, 60 * 24 * 365, '/', null, true, true, false, 'Lax'));
        }

        // Log final state
        Log::debug('SetLocale middleware - Final state', [
            'locale' => $locale,
            'cookie' => $request->cookie('locale'),
            'session' => $request->session()->get('locale'),
            'path' => $request->path(),
            'isStatsPage' => str_contains($request->path(), '/links/stats')
        ]);

        return $next($request);
    }
} 