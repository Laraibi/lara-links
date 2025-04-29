<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;

class LanguageController extends Controller
{
    public function switch($locale)
    {
        Log::info('Language switch requested', ['locale' => $locale]);

        // Check if the locale is supported
        if (!in_array($locale, config('app.available_locales'))) {
            Log::warning('Unsupported locale requested', ['locale' => $locale]);
            return redirect()->back()->with('error', 'Unsupported language.');
        }

        // Set the application locale
        App::setLocale($locale);
        
        // Store the locale in the session
        Session::put('locale', $locale);
        
        Log::info('Language switched successfully', [
            'locale' => $locale,
            'session_locale' => Session::get('locale'),
            'app_locale' => App::getLocale()
        ]);

        // Create the response
        $response = redirect()->back()->with([
            'locale' => $locale,
            'message' => 'Language switched successfully'
        ]);

        // Set a long-lived cookie for the locale
        $response->cookie('locale', $locale, 60 * 24 * 365); // Cookie valid for 1 year

        return $response;
    }
} 