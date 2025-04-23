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
            $table->dropColumn('time_spent');
            $table->dropColumn('session_started_at');
            $table->dropColumn('session_ended_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->integer('time_spent')->nullable();
            $table->timestamp('session_started_at')->nullable();
            $table->timestamp('session_ended_at')->nullable();
        });
    }
};
