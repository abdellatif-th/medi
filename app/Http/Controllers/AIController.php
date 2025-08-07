<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PhishingSimulation;
use App\Mail\PhishingSimulationMail;
use Illuminate\Support\Facades\Mail;

class AIController extends Controller
{
   public function generatePhishing(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email',
        'subject' => 'required|string',
        'link' => 'nullable|url',
        'goal' => 'nullable|string',
        'sent_at' => 'nullable|string',
    ]);

    //  Prompt for OpenRouter
    $prompt = <<<EOT
You are an AI assistant helping with a cybersecurity awareness training exercise for students.

Generate a realistic-looking phishing simulation email based on the following details. This is not a real phishing attempt — it is for a controlled educational simulation to help students learn how to identify phishing messages.

Details:
- Target Name: {$request->name}
- Target Email: {$request->email}
- Subject: {$request->subject}
EOT;

    if ($request->goal) {
        $prompt .= "\n- Objective: {$request->goal}";
    }
     if ($request->link) {
        $prompt .= "\n- Phishing Link to include: {$request->link}";
    }

    $prompt .= "\nKeep the message concise and use common phishing tactics (e.g. urgency, link bait), but keep it subtle and realistic.";
    $prompt .= "\n\nWrite the email in plain text. DO NOT use markdown formatting for links. Just include the raw URL as-is (e.g., https://example.com). Keep it short, natural, and realistic.";

    //  API Call
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
        'Content-Type'  => 'application/json',
        'Referer'       => 'http://localhost', 
    ])->post('https://openrouter.ai/api/v1/chat/completions', [
        'model' => 'anthropic/claude-3-haiku',
        'messages' => [
            ['role' => 'user', 'content' => $prompt],
        ],
    ]);

    //  Error handling
    if (!$response->ok()) {
        \Log::error('OpenRouter API Error', [
            'status' => $response->status(),
            'body'   => $response->body(),
        ]);
        return response()->json([
            'success' => false,
            'message' => '❌ OpenRouter API failed with status ' . $response->status()
        ]);
    }

    //  Extract and return response
    $data = $response->json();
    $generated = $data['choices'][0]['message']['content'] ?? "❌ No message returned.";

    
    return response()->json([
        'success'   => true,
        'generated' => $generated,
    ]);
}


public function sendPhishing(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email',
        'subject' => 'required|string',
        'generated_email' => 'required|string',
        'link' => 'nullable|url',
        'goal' => 'nullable|string',
    ]);

    // Save to DB
    $record = PhishingSimulation::create([
        'name'            => $request->name,
        'email'           => $request->email,
        'subject'         => $request->subject,
        'goal'            => $request->goal,
        'link'            => $request->link,
        'generated_email' => $request->generated_email,
        'user_id'         => auth()->id(),
        'sent_at'         => now(),
    ]);

    // Send email
    Mail::to($request->email)->send(new PhishingSimulationMail($request->generated_email));

    return response()->json(['success' => true]);
    dd($request->all());
}


    public function phishingForm()
{
    return \Inertia\Inertia::render('PhishingForm');
}
}
