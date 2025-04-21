<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->string('country')->nullable()->after('language');
            $table->string('city')->nullable()->after('country');
            $table->string('browser')->nullable()->after('city');
            $table->string('browser_version')->nullable()->after('browser');
            $table->string('platform')->nullable()->after('browser_version');
            $table->string('platform_version')->nullable()->after('platform');
            $table->string('device_type')->nullable()->after('platform_version');
            $table->string('screen_resolution')->nullable()->after('device_type');
            $table->string('referrer_url')->nullable()->after('screen_resolution');
            $table->integer('time_spent')->nullable()->after('referrer_url');
            $table->text('user_agent')->nullable()->after('time_spent');
            $table->timestamp('session_started_at')->nullable()->after('user_agent');
            $table->timestamp('session_ended_at')->nullable()->after('session_started_at');
            $table->json('additional_data')->nullable()->after('session_ended_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->dropColumn([
                'country',
                'city',
                'browser',
                'browser_version',
                'platform',
                'platform_version',
                'device_type',
                'screen_resolution',
                'referrer_url',
                'time_spent',
                'user_agent',
                'session_started_at',
                'session_ended_at',
                'additional_data'
            ]);
        });
    }
};
