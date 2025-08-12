<?php

namespace App\Http\Controllers;


use App\Models\PhishingSimulation;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $emails = PhishingSimulation::where('user_id', auth()->id())
                ->latest()
                ->get();

        return inertia(
            'Dashboard',
            compact(
              
                'emails'
            )
        );
    }
}
