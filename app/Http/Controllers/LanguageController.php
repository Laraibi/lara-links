<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function switch(Request $request, $locale)
    {
        // Validate locale
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'en';
        }

        // Set the locale in the session
        Session::put('locale', $locale);
        
        // Set the application locale
        App::setLocale($locale);

        // Get the current page data from the request header
        $page = $request->header('X-Inertia-Page');
        
        if ($page) {
            try {
                $pageData = json_decode($page, true);
                
                if ($pageData && isset($pageData['component']) && isset($pageData['props'])) {
                    // Return an Inertia response with the current page data
                    return Inertia::render($pageData['component'], [
                        'locale' => $locale,
                        ...$pageData['props']
                    ])->withCookie(cookie('locale', $locale, 60 * 24 * 365)); // 1 year
                }
            } catch (\Exception $e) {
                // Log the error but continue with redirect
                Log::error('Error parsing Inertia page data: ' . $e->getMessage());
            }
        }

        // If we can't get the page data, redirect back to the previous page
        return redirect()->back()->withCookie(cookie('locale', $locale, 60 * 24 * 365)); // 1 year
    }
} 