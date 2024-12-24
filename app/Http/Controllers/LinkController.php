<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\link;
use Illuminate\Support\Facades\Auth;
use App\Models\Visit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LinkController extends Controller
{
    //

    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url|max:2048',
        ]);

        try {
            $link = link::create([
                'original' => $request->url,
                'user_id' => Auth::id(),
                'code' => link::generateUniqueCode(), // Extracted logic
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Link shortened successfully!',
                'data' => [
                    'id' => $link->id,
                    'original_url' => $link->original,
                    'short_url' => url("/{$link->code}"),
                    'created_at' => $link->created_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function redirectToOriginal($code, Request $request)
    {
        // Find the link by code
        $link = link::where('code', $code)->firstOrFail();

        // Collect visitor data
        $device = $request->header('User-Agent');
        $language = $request->getPreferredLanguage();
        $timestamp = now();
        $ip = $request->ip();

        // Get geolocation using an external API (e.g., ipstack or GeoIP)
        $geoData = $this->getGeoData($ip);

        // Log the visit
        Visit::create([
            'link_id' => $link->id,
            'device' => $device,
            'language' => $language,
            'visited_at' => $timestamp,
            'country' => $geoData['country'] ?? null,
            'city' => $geoData['city'] ?? null,
            'ip' => $ip
        ]);

        // Redirect to the original URL
        return redirect()->to($link->original);
    }

    // Helper function for geolocation
    protected function getGeoData($ip)
    {
        try {
            // Example with free API (replace with your chosen provider)
            $response = Http::get("http://ip-api.com/json/{$ip}");
            if ($response->ok()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Log error
            Log::alert($e->getMessage());
        }
        return [];
    }

    // Fetch links added by the logged-in user
    public function dashboardLinks()
    {
        $links = Link::where('user_id', Auth::user()->id)
            ->withCount('visits') // Count visits for each link
            ->get();

        return response()->json($links);
    }

    public function linkStats(Link $link)
    {
        // Aggregate visit stats
        $visitsByDate = Visit::selectRaw('DATE(visited_at) as date, COUNT(*) as total')
            ->where('link_id', $link->id)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $visitsByCountry = Visit::selectRaw('country, COUNT(*) as total')
            ->where('link_id', $link->id)
            ->groupBy('country')
            ->orderByDesc('total')
            ->get();

        $visitsByCity = Visit::selectRaw('city, COUNT(*) as total')
            ->where('link_id', $link->id)
            ->groupBy('city')
            ->orderByDesc('total')
            ->get();

        $visitsByLanguage = Visit::selectRaw('language, COUNT(*) as total')
            ->where('link_id', $link->id)
            ->groupBy('language')
            ->orderByDesc('total')
            ->get();


        return Inertia::render('Stats', [
            'id' => $link->id,
            'visits_by_date' => $visitsByDate,
            'visits_by_country' => $visitsByCountry,
            'visits_by_city' => $visitsByCity,
            'visits_by_language' => $visitsByLanguage,
        ]);
    }
}
