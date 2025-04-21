<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Link;
use App\Models\User;

class LinkSeeder extends Seeder
{
    public function run(): void
    {
        // Get all users
        $users = User::all();

        // For each user, create 3-5 links
        foreach ($users as $user) {
            $numberOfLinks = rand(3, 5);
            
            for ($i = 0; $i < $numberOfLinks; $i++) {
                Link::create([
                    'user_id' => $user->id,
                    'original' => fake()->url(),
                    'code' => Link::generateUniqueCode(),
                    'name' => fake()->words(2, true),
                    'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                    'updated_at' => now(),
                ]);
            }
        }
    }
} 