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
        'link' => 'nullable|url',
        'goal' => 'nullable|string',
        'sent_at' => 'nullable|string',
    ]);

    //  Prompt for OpenRouter
    $prompt = <<<EOT
You are a cybersecurity AI assistant helping design realistic phishing simulation emails for educational purposes.

This exercise is part of a controlled cybersecurity awareness training program. The goal is to help students learn how to identify phishing emails in a safe and responsible environment.

Please generate a realistic and convincing phishing email based on the following information. The email should look authentic, but it must NOT include malicious content. It is only used in a simulated environment.

Use persuasive language, typical phishing techniques (urgency, authority, fear of loss, etc.), and a professional tone. The result should mimic a real-world phishing attempt while remaining ethical and educational.

Details for the simulation:
- **Target Name:** {$request->name}
- **Target Email:** {$request->email}
- **Phishing Goal:** {$request->goal}

Format the response as a full email body with a subject line.

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
        'generated_email' => 'required|string',
        'link' => 'nullable|url',
        'goal' => 'nullable|string',
    ]);

    // Save to DB
    $record = PhishingSimulation::create([
        'name'            => $request->name,
        'email'           => $request->email,
        'goal'            => $request->goal,
        'link'            => $request->link,
        'generated_email' => $request->generated_email,
        'user_id'         => auth()->id(),
        'sent'         => true,
    ]);

    // Send email
    Mail::to($request->email)->send(new PhishingSimulationMail($request->generated_email, $record->id, $request->link));
    
    return response()->json(['success' => true]);
    dd($request->all());
}


    public function phishingForm()
{
    return \Inertia\Inertia::render('PhishingForm');
}
}
