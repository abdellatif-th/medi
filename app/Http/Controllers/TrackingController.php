<?php


namespace App\Http\Controllers;

use App\Models\PhishingSimulation;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function trackOpen($id)
    {
        $email = PhishingSimulation::find($id);
        if ($email && !$email->opened) {
            $email->opened = true;
            $email->save();
        }

        // Return 1x1 transparent GIF pixel
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
        return response($pixel, 200)->header('Content-Type', 'image/gif');
    }

    public function trackClick(Request $request, $id)
    {
        $email = PhishingSimulation::find($id);
        $redirectUrl = $request->query('redirect');

        if ($email && !$email->clicked && filter_var($redirectUrl, FILTER_VALIDATE_URL)) {
            $email->clicked = true;
            $email->clicked_url = $redirectUrl;
            $email->save();
        }

        return redirect($redirectUrl ?? '/');
    }
}

