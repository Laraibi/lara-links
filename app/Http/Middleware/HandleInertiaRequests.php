<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        // Get locale from cookie first, then session, then default to English
        $locale = $request->cookie('locale') ?? $request->session()->get('locale', 'en');
        
        // Validate locale
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'en';
        }

        // Set the application locale
        app()->setLocale($locale);

        // Log the locale being shared
        Log::debug('Sharing locale with Inertia', [
            'locale' => $locale,
            'cookie' => $request->cookie('locale'),
            'session' => $request->session()->get('locale'),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'isStatsPage' => str_contains($request->path(), '/links/stats')
        ]);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'type' => fn () => $request->session()->get('type'),
            ],
            'locale' => $locale,
            'errors' => fn () => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->getMessages()
                : (object) [],
        ]);
    }
}
