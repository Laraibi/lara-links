<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // First check session
        $locale = Session::get('locale');
        
        // If no locale in session, check cookie
        if (!$locale) {
            $locale = $request->cookie('locale');
        }
        
        // If no locale in cookie, check browser preference
        if (!$locale) {
            $locale = $request->getPreferredLanguage(config('app.available_locales'));
        }
        
        // If still no locale, use default
        if (!$locale || !in_array($locale, config('app.available_locales'))) {
            $locale = config('app.locale');
        }

        // Set the application locale
        App::setLocale($locale);
        
        // Store in session for future requests
        Session::put('locale', $locale);

        // Get the response
        $response = $next($request);

        // If the response is a regular HTTP response, set the locale cookie
        if ($response instanceof \Illuminate\Http\Response || $response instanceof \Illuminate\Http\RedirectResponse) {
            $response->cookie('locale', $locale, 60 * 24 * 365); // Cookie valid for 1 year
        }

        return $response;
    }
} 