<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visit;
use App\Models\Link;
use Carbon\Carbon;

class VisitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all links
        $links = Link::all();

        // Define arrays for random data
        $devices = ['Desktop', 'Mobile', 'Tablet'];
        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
        $platforms = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
        $countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'Spain'];
        $cities = ['New York', 'London', 'Toronto', 'Berlin', 'Paris', 'Tokyo', 'Sydney', 'São Paulo', 'Mumbai', 'Madrid'];
        $languages = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'pt-BR', 'hi-IN'];
        $screenResolutions = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720', '2560x1440', '3840x2160'];

        // Set fixed date range for all visits (using dates from 2023)
        $startDate = Carbon::create(2023, 1, 1);
        $endDate = Carbon::create(2023, 12, 31);

        foreach ($links as $link) {
            // Generate 10-50 visits for each link
            $numVisits = rand(10, 50);
            
            for ($i = 0; $i < $numVisits; $i++) {
                // Generate random device type
                $deviceType = $devices[array_rand($devices)];
                
                // Generate random browser and version
                $browser = $browsers[array_rand($browsers)];
                $browserVersion = rand(1, 100) . '.' . rand(0, 9) . '.' . rand(0, 999);
                
                // Generate random platform and version
                $platform = $platforms[array_rand($platforms)];
                $platformVersion = rand(1, 20) . '.' . rand(0, 9) . '.' . rand(0, 9);
                
                // Generate random country and city
                $country = $countries[array_rand($countries)];
                $city = $cities[array_rand($cities)];
                
                // Generate random language
                $language = $languages[array_rand($languages)];
                
                // Generate random screen resolution
                $screenResolution = $screenResolutions[array_rand($screenResolutions)];
                
                // Generate random IP address
                $ip = rand(1, 255) . '.' . rand(0, 255) . '.' . rand(0, 255) . '.' . rand(0, 255);
                
                // Generate random time spent (in seconds)
                $timeSpent = rand(10, 3600);
                
                // Generate random referrer URL (50% chance of having one)
                $referrerUrl = rand(0, 1) ? 'https://' . $platforms[array_rand($platforms)] . '.com/page' . rand(1, 10) : null;
                
                // Generate random user agent
                $userAgent = 'Mozilla/5.0 (' . $platform . '; ' . $deviceType . ') AppleWebKit/537.36 (KHTML, like Gecko) ' . $browser . '/' . $browserVersion;
                
                // Generate random visit date (between startDate and endDate)
                $visitedAt = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));
                
                // Generate session times (session start before visit, session end after visit, but not crossing days)
                $sessionStartedAt = $visitedAt->copy()->subMinutes(rand(1, 30));
                $sessionEndedAt = $visitedAt->copy()->addMinutes(rand(1, 60));
                
                // Generate random UTM parameters (30% chance of having them)
                $additionalData = [];
                if (rand(0, 1) && rand(0, 1) && rand(0, 1)) {
                    $additionalData = [
                        'utm_source' => $platforms[array_rand($platforms)],
                        'utm_medium' => ['email', 'social', 'cpc', 'organic'][array_rand(['email', 'social', 'cpc', 'organic'])],
                        'utm_campaign' => ['spring_sale', 'new_product', 'holiday', 'newsletter'][array_rand(['spring_sale', 'new_product', 'holiday', 'newsletter'])]
                    ];
                }
                
                // Create the visit
                Visit::create([
                    'link_id' => $link->id,
                    'ip' => $ip,
                    'device' => $deviceType,
                    'language' => $language,
                    'visited_at' => $visitedAt,
                    'country' => $country,
                    'city' => $city,
                    'browser' => $browser,
                    'browser_version' => $browserVersion,
                    'platform' => $platform,
                    'platform_version' => $platformVersion,
                    'device_type' => $deviceType,
                    'screen_resolution' => $screenResolution,
                    'referrer_url' => $referrerUrl,
                    'time_spent' => $timeSpent,
                    'user_agent' => $userAgent,
                    'session_started_at' => $sessionStartedAt,
                    'session_ended_at' => $sessionEndedAt,
                    'additional_data' => $additionalData
                ]);
            }
        }
    }
} 