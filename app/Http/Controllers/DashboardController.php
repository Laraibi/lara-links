<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $links = Link::where('user_id', $user->id)
            ->withCount('visits')
            ->with(['visits' => function($query) {
                $query->where('visited_at', '>=', now()->subDays(7))
                      ->orderBy('visited_at', 'desc');
            }])
            ->get();
        
        // Get all visits for the user's links
        $linkIds = $links->pluck('id');
        $visits = Visit::whereIn('link_id', $linkIds)->get();
        
        // Calculate device statistics
        $deviceStats = $visits->groupBy('device_type')
            ->map(function($group) {
                return [
                    'device_type' => $group->first()->device_type,
                    'count' => $group->count()
                ];
            })->values();
        
        // Calculate country statistics
        $countryStats = $visits->groupBy('country')
            ->map(function($group) {
                return [
                    'country' => $group->first()->country ?: 'Unknown',
                    'count' => $group->count()
                ];
            })->values();
            
        return Inertia::render('Dashboard', [
            'links' => $links,
            'deviceStats' => $deviceStats,
            'countryStats' => $countryStats
        ]);
    }
} 