<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Link;
use Illuminate\Support\Facades\Auth;
use App\Models\Visit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Services\AnalyticsService;
use App\Services\AnalyticsExportService;
use Illuminate\Support\Facades\Storage;

class LinkController extends Controller
{
    protected $analyticsService;
    protected $exportService;

    public function __construct(AnalyticsService $analyticsService, AnalyticsExportService $exportService)
    {
        $this->analyticsService = $analyticsService;
        $this->exportService = $exportService;
    }

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

        // Check if the visit came from a QR code
        $source = 'direct';
        if ($request->has('source') && $request->source === 'qr') {
            $source = 'qr';
        }

        // Record the visit using our analytics service with the source
        $visit = $this->analyticsService->recordVisit($request, $link->id, $source);

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
            ->get()
            ->map(function ($link) {
                $linkArray = $link->toArray();
                $linkArray['qr_code_url'] = $link->getQrCodeUrl();
                return $linkArray;
            });

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

        // Get visit statistics with enhanced data
        $visits = $link->visits()->orderBy('visited_at', 'desc')->get();
        
        // Get visit counts by country
        $countryStats = $link->visits()
            ->selectRaw('country, COUNT(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get();
            
        // Get visit counts by device type
        $deviceStats = $link->visits()
            ->selectRaw('device_type, COUNT(*) as count')
            ->whereNotNull('device_type')
            ->groupBy('device_type')
            ->orderByDesc('count')
            ->get();

        // Log the stats for debugging
        Log::info('Link Stats:', [
            'link_id' => $link->id,
            'country_stats' => $countryStats->toArray(),
            'device_stats' => $deviceStats->toArray(),
            'total_visits' => $visits->count()
        ]);

        // Get visit counts by browser
        $browserStats = $link->visits()
            ->selectRaw('browser, COUNT(*) as count')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->get();

        // Get visit counts by platform
        $platformStats = $link->visits()
            ->selectRaw('platform, COUNT(*) as count')
            ->groupBy('platform')
            ->orderByDesc('count')
            ->get();
            
        // Get visit counts by day (last 30 days)
        $dailyStats = $link->visits()
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->where('visited_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get QR code statistics
        $qrCodeStats = [
            'total' => $link->visits()->where('source', 'qr')->count(),
            'direct' => $link->visits()->where('source', 'direct')->count(),
            'percentage' => $link->visits()->count() > 0 
                ? round(($link->visits()->where('source', 'qr')->count() / $link->visits()->count()) * 100, 2) 
                : 0
        ];

        // Get QR code visits by day (last 30 days)
        $qrCodeDailyStats = $link->visits()
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->where('source', 'qr')
            ->where('visited_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get average time spent - removed as session tracking is no longer available
        $avgTimeSpent = 0;

        return Inertia::render('Stats', [
            'link' => array_merge($link->toArray(), [
                'qr_code_url' => $link->getQrCodeUrl()
            ]),
            'visits' => $visits,
            'countryStats' => $countryStats,
            'deviceStats' => $deviceStats,
            'browserStats' => $browserStats,
            'platformStats' => $platformStats,
            'dailyStats' => $dailyStats,
            'qrCodeStats' => $qrCodeStats,
            'qrCodeDailyStats' => $qrCodeDailyStats,
            'avgTimeSpent' => round($avgTimeSpent ?? 0, 2),
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
        Log::info('Link update request received', [
            'link_id' => $link->id,
            'user_id' => Auth::id(),
            'request_data' => $request->all()
        ]);
        
        // Check if the user is authorized to update this link
        if ($link->user_id !== Auth::id()) {
            Log::warning('Unauthorized link update attempt', [
                'link_id' => $link->id,
                'user_id' => Auth::id()
            ]);
            
            return back()->with('error', 'You are not authorized to update this link.');
        }

        try {
            // Allow null or non-empty string for name
            $request->validate([
                'name' => 'nullable|string|max:255',
            ]);

            Log::info('Updating link name', [
                'link_id' => $link->id,
                'old_name' => $link->name,
                'new_name' => $request->input('name')
            ]);

            // Update the link name, converting empty string to null
            $name = $request->input('name');
            $link->update([
                'name' => $name === '' ? null : $name,
            ]);
            
            // Refresh the link to get the updated data
            $link->refresh();
            
            Log::info('Link updated successfully', [
                'link_id' => $link->id,
                'updated_name' => $link->name
            ]);
            
            // Return an Inertia response with flash data
            return back()->with([
                'success' => true,
                'message' => 'Link name updated successfully!',
                'updated_link' => $link->toArray()
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating link', [
                'link_id' => $link->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'An error occurred while updating the link.');
        }
    }

    public function exportAnalytics(Link $link, Request $request)
    {
        Log::info("Export request received for link ID: {$link->id}, format: {$request->input('format')}, type: {$request->input('type')}");
        
        // Check if the user is authorized to export this link's stats
        if ($link->user_id !== Auth::id()) {
            Log::warning("Unauthorized export attempt for link ID: {$link->id} by user ID: " . Auth::id());
            abort(403, 'Unauthorized action.');
        }

        $format = $request->input('format', 'csv');
        $type = $request->input('type', 'visits');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        
        Log::info("Processing export for link ID: {$link->id}, format: {$format}, type: {$type}, date range: {$startDate} to {$endDate}");

        try {
            switch ($format) {
                case 'csv':
                    Log::info("Calling exportToCsv for link ID: {$link->id}, type: {$type}");
                    $filename = $this->exportService->exportToCsv($link, $type, $startDate, $endDate);
                    break;
                case 'excel':
                case 'xlsx':
                    Log::info("Calling exportToExcel for link ID: {$link->id}");
                    $filename = $this->exportService->exportToExcel($link, $startDate, $endDate);
                    break;
                default:
                    abort(400, 'Invalid export format');
            }
            
            Log::info("Export successful, returning file: {$filename}");
            return response()->download(storage_path("app/exports/{$filename}"))->deleteFileAfterSend();
        } catch (\Exception $e) {
            Log::error("Export failed for link ID: {$link->id}, error: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            abort(500, 'Failed to generate export file');
        }
    }

    public function getAnalyticsReport(Link $link)
    {
        // Check if the user is authorized to view this link's stats
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $report = $this->exportService->generateReport($link);
            return response()->json($report);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to generate report'], 500);
        }
    }

    public function filterAnalytics(Link $link, Request $request)
    {
        // Check if the user is authorized to view this link's stats
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        // Base query for visits within the date range
        $visitsQuery = $link->visits()
            ->when($startDate, function ($query) use ($startDate) {
                return $query->whereDate('visited_at', '>=', $startDate);
            })
            ->when($endDate, function ($query) use ($endDate) {
                return $query->whereDate('visited_at', '<=', $endDate);
            });

        // Get filtered visits
        $visits = (clone $visitsQuery)->orderBy('visited_at', 'desc')->get();
        
        // Get filtered country stats
        $countryStats = (clone $visitsQuery)
            ->selectRaw('country, COUNT(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get();
            
        // Get filtered device stats
        $deviceStats = (clone $visitsQuery)
            ->selectRaw('device_type, COUNT(*) as count')
            ->groupBy('device_type')
            ->orderByDesc('count')
            ->get();

        // Get filtered browser stats
        $browserStats = (clone $visitsQuery)
            ->selectRaw('browser, COUNT(*) as count')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->get();

        // Get filtered platform stats
        $platformStats = (clone $visitsQuery)
            ->selectRaw('platform, COUNT(*) as count')
            ->groupBy('platform')
            ->orderByDesc('count')
            ->get();
            
        // Get filtered daily stats
        $dailyStats = (clone $visitsQuery)
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get filtered QR code stats
        $qrCodeStats = [
            'total' => (clone $visitsQuery)->where('source', 'qr')->count(),
            'direct' => (clone $visitsQuery)->where('source', 'direct')->count(),
            'percentage' => $visits->count() > 0 
                ? round(((clone $visitsQuery)->where('source', 'qr')->count() / $visits->count()) * 100, 2) 
                : 0
        ];

        // Get filtered QR code daily stats
        $qrCodeDailyStats = (clone $visitsQuery)
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
            ->where('source', 'qr')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get filtered average time spent - removed as session tracking is no longer available
        $avgTimeSpent = 0;

        return response()->json([
            'visits' => $visits,
            'countryStats' => $countryStats,
            'deviceStats' => $deviceStats,
            'browserStats' => $browserStats,
            'platformStats' => $platformStats,
            'dailyStats' => $dailyStats,
            'qrCodeStats' => $qrCodeStats,
            'qrCodeDailyStats' => $qrCodeDailyStats,
            'avgTimeSpent' => round($avgTimeSpent ?? 0, 2),
        ]);
    }

    public function generateQrCode(Link $link)
    {
        // Check if the user is authorized to generate QR code for this link
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            // If regenerate is requested, delete the old QR code
            if ( $link->qr_code_path) {
                Storage::disk('public')->delete($link->qr_code_path);
                $link->update(['qr_code_path' => null]);
            }

            $qrCodePath = $link->generateQrCode();
            
            if (!$qrCodePath) {
                return response()->json([
                    'error' => 'QR code generation is disabled for this link'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'qr_code_url' => $link->getQrCodeUrl()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    public function toggleQrCode(Link $link)
    {
        // Check if the user is authorized to toggle QR code for this link
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $link->update([
                'qr_code_enabled' => !$link->qr_code_enabled
            ]);

            return response()->json([
                'success' => true,
                'qr_code_enabled' => $link->qr_code_enabled
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to toggle QR code: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getQrCode(Link $link)
    {
        // Check if the user is authorized to view this link's QR code
        if ($link->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // If the link has a QR code path, return the URL
        if ($link->qr_code_path) {
            return response()->json([
                'success' => true,
                'qr_code_url' => $link->getQrCodeUrl()
            ]);
        }

        // Otherwise, return a 404 response
        return response()->json([
            'error' => 'QR code not found'
        ], 404);
    }
}
