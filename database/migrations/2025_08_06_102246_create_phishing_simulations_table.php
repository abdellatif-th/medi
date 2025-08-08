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
        Schema::create('phishing_simulations', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->text('goal')->nullable();
        $table->text('link')->nullable();
        $table->longText('generated_email'); 
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
        $table->boolean('clicked')->default(false);
        $table->boolean('opened')->default(false);
        $table->boolean('clicked_url')->default(false);
        $table->timestamp('sent_at')->nullable();
        $table->timestamps();

    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phishing_simulations');
    }
};
