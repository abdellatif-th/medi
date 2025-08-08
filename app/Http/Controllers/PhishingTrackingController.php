<?php

namespace App\Http\Controllers;

use App\Models\PhishingSimulation;
use Illuminate\Http\Request;

class PhishingTrackingController extends Controller
{
    public function trackClick(Request $request, $id)
    {
        $simulation = PhishingSimulation::findOrFail($id);

        // Mark the simulation as clicked
        $simulation->clicked = true;
        $simulation->clicked_url = $request->query('url'); // Save the real link
        $simulation->save();

        // Redirect to the real destination
        return redirect()->away($request->query('url'));
    }
}
