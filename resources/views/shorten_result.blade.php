@extends('layouts.base')

@section('css')
<link rel='stylesheet' href='/css/shorten_result.css' />
@endsection

@section('content')
<section class="ts-result-shell">
    <div class="ts-section-label"><span>02</span> / SHORTENED URL</div>
    <h1>Your TeamStation link is ready.</h1>
    <div class="input-group">
        <input type='text' class='result-box form-control' value='{{$short_url}}' id='short_url' readonly />
        <div class='input-group-addon' id='clipboard-copy' data-clipboard-target='#short_url' data-toggle='tooltip' data-placement='bottom' data-title='Copied!'>
            <i class='fa fa-clipboard' aria-hidden='true' title='Copy to clipboard'></i>
        </div>
    </div>

    <div class="ts-form-actions">
        <a id="generate-qr-code" class='btn btn-primary'>Generate QR Code</a>
        <a href='{{route('index')}}' class='btn btn-info'>Shorten Another</a>
    </div>

    <div class="qr-code-container"></div>
</section>

@endsection


@section('js')
<script src='/js/qrcode.min.js'></script>
<script src='/js/clipboard.min.js'></script>
<script src='/js/shorten_result.js'></script>
@endsection
