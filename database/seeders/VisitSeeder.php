<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Visit;
use Carbon\Carbon;

class VisitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if link ID 2 exists
        if (!\App\Models\Link::find(2)) {
            $this->command->info('Link ID 2 does not exist. Creating it first...');
            \App\Models\Link::create([
                'original' => 'https://example.com',
                'name' => 'Example Link',
                'user_id' => 1, // Assuming user ID 1 exists
                'code' => 'example',
            ]);
        }

        // Sample countries
        $countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Canada', 'Australia', 'Brazil', 'India', 'Spain'];
        
        // Sample devices
        $devices = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ];
        
        // Sample IP addresses
        $ips = [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '8.8.8.8',
            '1.1.1.1',
            '45.33.12.234',
            '76.76.21.98',
            '104.26.10.229',
            '185.199.108.153',
            '151.101.1.195',
        ];
        
        // Generate visits for the last 30 days
        $now = Carbon::now();
        $visits = [];
        
        // Create 100 sample visits
        for ($i = 0; $i < 100; $i++) {
            // Random date within the last 30 days
            $date = $now->copy()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            
            $visits[] = [
                'link_id' => 2,
                'device' => $devices[array_rand($devices)],
                'language' => ['en', 'es', 'fr', 'de', 'ja'][array_rand(['en', 'es', 'fr', 'de', 'ja'])],
                'visited_at' => $date,
                'country' => $countries[array_rand($countries)],
                'city' => ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Toronto', 'Sydney', 'São Paulo', 'Mumbai', 'Madrid'][array_rand(['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Toronto', 'Sydney', 'São Paulo', 'Mumbai', 'Madrid'])],
                'ip' => $ips[array_rand($ips)],
                'created_at' => $date,
                'updated_at' => $date,
            ];
        }
        
        // Insert all visits
        foreach ($visits as $visit) {
            Visit::create($visit);
        }
        
        $this->command->info('Sample visit data for link ID 2 has been created.');
    }
} 