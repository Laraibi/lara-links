<?php

namespace App\Services;

use App\Models\Visit;
use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;

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
            'session_started_at' => now(),
            'additional_data' => [
                'is_robot' => $this->agent->isRobot(),
                'is_mobile' => $this->agent->isMobile(),
                'is_tablet' => $this->agent->isTablet(),
                'is_desktop' => $this->agent->isDesktop(),
            ]
        ];
    }

    public function recordVisit(Request $request, $linkId)
    {
        $visitData = $this->collectVisitData($request, $linkId);
        return Visit::create($visitData);
    }

    public function updateVisitSession(Visit $visit)
    {
        $visit->update([
            'session_ended_at' => now(),
            'time_spent' => $visit->session_started_at->diffInSeconds(now())
        ]);
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
        // TODO: Implement IP geolocation
        return null;
    }

    protected function getCityFromIp($ip)
    {
        // TODO: Implement IP geolocation
        return null;
    }
}
