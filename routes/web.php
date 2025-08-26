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
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;

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

Route::get('/sensibilisationphishing', function () {
    return Inertia::render('SensibilisationPhishing');

})->middleware(['auth', 'verified'])->name('sensibilisationphishing');

Route::get('/phishing-table', function () {
    $emails = PhishingSimulation::all(); 
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
    Config::set('mail.mailers.smtp.encryption', $request->encryption);

    try {
        
        $transport = new EsmtpTransport(
            $request->host,
            $request->port,
            $request->encryption === 'tls' ? true : false
        );

        $transport->start(); // tests connection without sending email
        $transport->stop();

        return response()->json([
            'success' => true,
            'message' => '✅ SMTP connection successful!'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ SMTP connection failed: ' . $e->getMessage()
        ]);
    }
});
