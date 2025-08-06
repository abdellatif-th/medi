<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhishingSimulation extends Model
{
    use HasFactory;
    protected $fillable = [
    'name',
    'email',
    'subject',
    'goal',
    'link',
    'generated_email',
    'user_id',
];
}
