@php
    // Generate tracked link with redirect query param
    $trackedLink = route('track.click', ['id' => $simulationId, 'redirect' => $link]);
@endphp

{!! nl2br(e($generatedEmail)) !!}

<br><br>
<a href="{{ $trackedLink }}" target="_blank">Click here to update your account</a>

<img src="{{ route('track.open', ['id' => $simulationId]) }}" width="1" height="1" alt="" style="display:none;" />
