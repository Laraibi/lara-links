<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function switch(Request $request, string $locale)
    {
        Log::info('Language switch requested', [
            'requested_locale' => $locale,
            'current_locale' => App::getLocale(),
            'cookie_locale' => $request->cookie('locale'),
            'session_locale' => Session::get('locale'),
            'url' => $request->fullUrl()
        ]);

        // Validate locale
        if (!in_array($locale, ['en', 'fr'])) {
            Log::warning('Invalid locale requested', ['locale' => $locale]);
            return back()->with('error', 'Invalid language selected.');
        }

        // Set locale in session
        Session::put('locale', $locale);
        
        // Set locale in cookie
        $cookie = cookie('locale', $locale, 60 * 24 * 365, '/', null, true, true); // 1 year, secure, httpOnly
        
        // Set application locale
        App::setLocale($locale);

        Log::info('Language switch completed', [
            'new_locale' => $locale,
            'session_set' => Session::has('locale'),
            'cookie_set' => $request->hasCookie('locale')
        ]);

        // Handle Inertia requests
        if ($request->header('X-Inertia')) {
            $page = $request->header('X-Inertia-Page');
            try {
                $pageData = json_decode($page, true);
                if ($pageData && isset($pageData['component'])) {
                    return Inertia::render($pageData['component'], [
                        'locale' => $locale,
                        ...($pageData['props'] ?? [])
                    ])->withCookie($cookie);
                }
            } catch (\Exception $e) {
                Log::error('Error parsing Inertia page data: ' . $e->getMessage());
            }
        }

        return back()->withCookie($cookie);
    }
} 