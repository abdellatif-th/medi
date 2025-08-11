@php
    // Generate base route with id param only
    $baseLink = route('track.click', ['id' => $simulationId]);

    // Append redirect query param with urlencode
    $trackedLink = $baseLink . '?redirect=' . urlencode($link);

    // Replace the raw link in the generated email with your tracked link anchor
    $emailWithTrackedLink = str_replace(
        $link,
        '<a href="' . $trackedLink . '" target="_blank">Click here to update your account</a>',
        $generatedEmail
    );
@endphp

{!! nl2br($emailWithTrackedLink) !!}

<!-- <img src="{{ route('track.open', ['id' => $simulationId]) }}" width="1" height="1" alt="" style="display:none;" /> -->
