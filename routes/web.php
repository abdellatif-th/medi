<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\AIController;
use App\Models\PhishingSimulation;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
   
});
 Route::resource('user', UserController::class);
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



Route::post('/phishing/generate', [AIController::class, 'generatePhishing'])
    ->middleware('auth')
    ->name('phishing.generate');

Route::post('/phishing/send', [AIController::class, 'sendPhishing'])
    ->middleware('auth')
    ->name('phishing.send');


Route::get('/phishing-form', function () {
    return Inertia::render('Phishing/Show');
})->middleware(['auth', 'verified'])->name('phishing-form');

Route::get('/phishing-table', function () {
    $emails = PhishingSimulation::all(); // Or whatever query you need
    return Inertia::render('Phishingsenttables/Show', [
        'emails' => $emails
    ]);
})->middleware(['auth', 'verified'])->name('phishing-table');

Route::get('/track/open/{id}', [TrackingController::class, 'trackOpen'])->name('track.open');
Route::get('/track/click/{id}', [TrackingController::class, 'trackClick'])->name('track.click');

require __DIR__ . '/auth.php';
//TESTING SMTP 


Route::post('/smtp-check', function (Request $request) {
    // dynamically set SMTP config
    Config::set('mail.mailers.smtp.host', $request->host);
    Config::set('mail.mailers.smtp.port', $request->port);
    Config::set('mail.mailers.smtp.username', $request->username);
    Config::set('mail.mailers.smtp.password', $request->password);
    Config::set('mail.mailers.smtp.encryption', $request->encryption);
    Config::set('mail.from.address', $request->from_email);
    Config::set('mail.from.name', $request->from_name);

    try {
        // test connection by sending a dummy email
        Mail::raw('SMTP Test', function ($message) use ($request) {
            $message->to($request->test_email ?? $request->username)
                    ->subject('SMTP Test');
        });

        return response()->json(['success' => true, 'message' => '✅ Authenticated!']);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => '❌ Authentication failed! '  . $e->getMessage()]);
    }
});
