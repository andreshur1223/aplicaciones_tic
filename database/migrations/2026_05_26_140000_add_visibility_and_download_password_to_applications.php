<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->boolean('visible_in_catalog')->default(true)->after('active');
            $table->boolean('requires_download_password')->default(false)->after('visible_in_catalog');
            $table->string('download_password_hash')->nullable()->after('requires_download_password');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['visible_in_catalog', 'requires_download_password', 'download_password_hash']);
        });
    }
};
