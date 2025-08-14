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

    public function __construct(
        public string $generatedEmail,
        public int $simulationId,
        public string $link
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ATTENTION',
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
