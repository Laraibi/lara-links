<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Link;
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
            'name' => 'nullable|string|max:255',
        ]);

        try {
            $link = Link::create([
                'original' => $request->url,
                'name' => $request->name,
                'user_id' => Auth::id(),
                'code' => Link::generateUniqueCode(),
            ]);

            // Get all links for the user to update the dashboard
            $links = Link::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            // Return a redirect with flash data for Inertia
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Link shortened successfully!',
                'short_url' => url($link->code),
                'new_link' => $link->toArray(),
                'links' => $links
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with([
                'error' => 'An error occurred while shortening the link.',
            ]);
        }
    }

    public function redirectToOriginal($code, Request $request)
    {
        // Find the link by code
        $link = Link::where('code', $code)->firstOrFail();

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

        // Check if the request expects JSON (API request)
        if (request()->expectsJson()) {
            return response()->json($links);
        }

        // Otherwise, return an Inertia response
        return Inertia::render('DashboardLinks', [
            'links' => $links
        ]);
    }

    public function linkStats(Link $link)
    {
        // Check if the user is authorized to view this link's stats
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Get visit statistics
        $visits = $link->visits()->orderBy('visited_at', 'desc')->get();
        
        // Get visit counts by country
        $countryStats = $link->visits()
            ->selectRaw('country, COUNT(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get();
            
        // Get visit counts by device type (simplified)
        $deviceStats = $link->visits()
            ->selectRaw('device, COUNT(*) as count')
            ->groupBy('device')
            ->orderByDesc('count')
            ->get();
            
        // Get visit counts by day (last 30 days)
        $dailyStats = $link->visits()
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->where('visited_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Stats', [
            'link' => $link,
            'visits' => $visits,
            'countryStats' => $countryStats,
            'deviceStats' => $deviceStats,
            'dailyStats' => $dailyStats,
        ]);
    }

    public function destroy(Link $link)
    {
        // Check if the user is authorized to delete this link
        if ($link->user_id !== Auth::id()) {
            return redirect()->back()->with([
                'error' => 'You are not authorized to delete this link.',
            ]);
        }

        try {
            $link->delete();
            
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Link deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with([
                'error' => 'An error occurred while deleting the link.',
            ]);
        }
    }

    public function update(Request $request, Link $link)
    {
        // Check if the user is authorized to update this link
        if ($link->user_id !== Auth::id()) {
            return redirect()->back()->with([
                'error' => 'You are not authorized to update this link.',
            ]);
        }

        try {
            $request->validate([
                'name' => 'nullable|string|max:255',
            ]);

            $link->update([
                'name' => $request->name,
            ]);
            
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Link updated successfully!',
                'updated_link' => $link->toArray(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with([
                'error' => 'An error occurred while updating the link.',
            ]);
        }
    }
}
