<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assignee_id')
                ->nullable()
                ->after('project_id')
                ->constrained('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['assignee_id']);
            $table->dropColumn('assignee_id');
        });
    }
};
