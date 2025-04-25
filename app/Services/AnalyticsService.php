<?php

namespace App\Services;

use App\Models\Visit;
use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    protected $agent;

    public function __construct()
    {
        $this->agent = new Agent();
    }

    public function collectVisitData(Request $request, $linkId)
    {
        $this->agent->setUserAgent($request->userAgent());

        return [
            'link_id' => $linkId,
            'ip' => $request->ip(),
            'device' => $this->agent->device(),
            'language' => $request->getPreferredLanguage(),
            'visited_at' => now(),
            'country' => $this->getCountryFromIp($request->ip()),
            'city' => $this->getCityFromIp($request->ip()),
            'browser' => $this->agent->browser(),
            'browser_version' => $this->agent->version($this->agent->browser()),
            'platform' => $this->agent->platform(),
            'platform_version' => $this->agent->version($this->agent->platform()),
            'device_type' => $this->getDeviceType(),
            'screen_resolution' => $request->header('sec-ch-viewport-width') . 'x' . $request->header('sec-ch-viewport-height'),
            'referrer_url' => $request->header('referer'),
            'user_agent' => $request->userAgent(),
            'additional_data' => [
                'is_robot' => $this->agent->isRobot(),
                'is_mobile' => $this->agent->isMobile(),
                'is_tablet' => $this->agent->isTablet(),
                'is_desktop' => $this->agent->isDesktop(),
            ]
        ];
    }

    public function recordVisit(Request $request, $linkId, $source = 'direct')
    {
        try {
            // Get IP address
            $ip = $request->ip();
            
            // Get geolocation data
            $geoData = $this->getGeoData($ip);
            
            // Get device and browser information
            $agent = new Agent();
            $agent->setUserAgent($request->userAgent());
            
            // Create visit record
            $visit = Visit::create([
                'link_id' => $linkId,
                'ip' => $ip,
                'device' => $agent->device(),
                'language' => $request->getPreferredLanguage(),
                'visited_at' => now(),
                'country' => $geoData['country'] ?? null,
                'city' => $geoData['city'] ?? null,
                'browser' => $agent->browser(),
                'browser_version' => $agent->version($agent->browser()),
                'platform' => $agent->platform(),
                'platform_version' => $agent->version($agent->platform()),
                'device_type' => $this->getDeviceType($agent),
                'screen_resolution' => $request->header('Sec-CH-UA-Viewport-Width') . 'x' . $request->header('Sec-CH-UA-Viewport-Height'),
                'referrer_url' => $request->header('referer'),
                'user_agent' => $request->userAgent(),
                'additional_data' => [
                    'headers' => $request->headers->all(),
                ],
                'source' => $source
            ]);
            
            return $visit;
        } catch (\Exception $e) {
            Log::error('Error recording visit: ' . $e->getMessage());
            return null;
        }
    }

    protected function getDeviceType()
    {
        if ($this->agent->isMobile()) {
            return 'mobile';
        } elseif ($this->agent->isTablet()) {
            return 'tablet';
        } elseif ($this->agent->isDesktop()) {
            return 'desktop';
        }
        return 'unknown';
    }

    protected function getCountryFromIp($ip)
    {
        try {
            $response = Http::get("http://ip-api.com/json/{$ip}");
            if ($response->ok()) {
                $data = $response->json();
                return $data['country'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('Error getting country from IP: ' . $e->getMessage());
        }
        return null;
    }

    protected function getCityFromIp($ip)
    {
        try {
            $response = Http::get("http://ip-api.com/json/{$ip}");
            if ($response->ok()) {
                $data = $response->json();
                return $data['city'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('Error getting city from IP: ' . $e->getMessage());
        }
        return null;
    }

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
            Log::error('Error getting geo data: ' . $e->getMessage());
        }
        return [];
    }
}
