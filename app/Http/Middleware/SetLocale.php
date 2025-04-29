<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        // First check session
        $locale = Session::get('locale');
        
        // Then check cookie
        if (!$locale) {
            $locale = $request->cookie('locale');
        }
        
        // Then check browser language
        if (!$locale && $request->hasHeader('Accept-Language')) {
            $browserLocale = substr($request->header('Accept-Language'), 0, 2);
            if (in_array($browserLocale, config('app.available_locales'))) {
                $locale = $browserLocale;
            }
        }
        
        // Default to config locale if none found
        if (!$locale || !in_array($locale, config('app.available_locales'))) {
            $locale = config('app.locale');
        }

        // Set the application locale
        App::setLocale($locale);
        
        // Store in session and cookie for persistence
        Session::put('locale', $locale);
        Cookie::queue(Cookie::forever('locale', $locale));

        return $next($request);
    }
} 