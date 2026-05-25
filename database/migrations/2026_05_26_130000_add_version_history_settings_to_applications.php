<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->boolean('keep_version_history')->default(false)->after('active');
            $table->unsignedTinyInteger('max_versions_to_keep')->default(5)->after('keep_version_history');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['keep_version_history', 'max_versions_to_keep']);
        });
    }
};
