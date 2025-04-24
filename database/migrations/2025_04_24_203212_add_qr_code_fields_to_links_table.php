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
        Schema::table('links', function (Blueprint $table) {
            $table->string('qr_code_path')->nullable()->after('code');
            $table->boolean('qr_code_enabled')->default(true)->after('qr_code_path');
            $table->string('qr_code_style')->default('default')->after('qr_code_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('links', function (Blueprint $table) {
            $table->dropColumn(['qr_code_path', 'qr_code_enabled', 'qr_code_style']);
        });
    }
};
