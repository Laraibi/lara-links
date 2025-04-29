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
        if (Session::has('locale')) {
            $locale = Session::get('locale');
        }
        // Then check cookie
        else if ($request->hasCookie('locale')) {
            $locale = $request->cookie('locale');
            // Store in session for future requests
            Session::put('locale', $locale);
        }
        // Finally check Accept-Language header
        else {
            $locale = $request->getPreferredLanguage(['en', 'fr']);
            // Store in both session and cookie
            Session::put('locale', $locale);
            cookie()->queue('locale', $locale, 60 * 24 * 365); // 1 year
        }

        // Ensure locale is valid
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'en';
            Session::put('locale', $locale);
            cookie()->queue('locale', $locale, 60 * 24 * 365); // 1 year
        }

        // Set the application locale
        App::setLocale($locale);

        // Set cookie if not already set
        if (!$request->hasCookie('locale')) {
            cookie()->queue('locale', $locale, 60 * 24 * 365); // 1 year
        }

        // Set the locale in the response
        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }
} 