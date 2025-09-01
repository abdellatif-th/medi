<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PhishingSimulationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $generatedEmail;
    public $simulationId;
    public $link;
    public $subject; // no type!

    public function __construct($generatedEmail, $simulationId, $link, $subject = "ATTENTION")
    {
        $this->generatedEmail = $generatedEmail;
        $this->simulationId = $simulationId;
        $this->link = $link;
        $this->subject = $subject; // dynamic subject
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject, // dynamic subject used here
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.simulation',
            with: [
                'generatedEmail' => $this->generatedEmail,
                'simulationId' => $this->simulationId,
                'link' => $this->link,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
