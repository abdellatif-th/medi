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
Vous êtes un assistant IA en cybersécurité aidant à concevoir des emails de simulation de phishing réalistes à des fins éducatives.

Cet exercice fait partie d'un programme contrôlé de sensibilisation à la cybersécurité. L'objectif est d'aider les étudiants à apprendre à identifier les emails de phishing dans un environnement sûr et responsable.

Veuillez générer un email de phishing réaliste et convaincant basé sur les informations suivantes. L'email doit sembler authentique, mais il NE DOIT PAS contenir de contenu malveillant. Il est uniquement utilisé dans un environnement simulé.

Utilisez un langage persuasif, des techniques typiques de phishing (urgence, autorité, peur de la perte, etc.) et un ton professionnel. Le résultat doit imiter une tentative de phishing réelle tout en restant éthique et éducatif.

Détails pour la simulation :
- **Nom de la cible :** {$request->name}
- **Email de la cible :** {$request->email}
- **Objectif de phishing :** {$request->goal}

Format de la réponse : corps complet de l'email avec ligne d'objet.

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
