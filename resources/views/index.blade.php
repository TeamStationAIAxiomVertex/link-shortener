@extends('layouts.base')

@section('css')
<link rel='stylesheet' href='css/index.css' />
@endsection

@section('content')
<section class="ts-hero">
    <div class="ts-hero-copy">
        <div class="ts-section-label"><span>01</span> / SHORT LINKS</div>
        <h1>TeamStation links, routed cleanly.</h1>
        <p>
            Convert meeting, job, proof, and operations links into controlled short URLs your team can share without visual noise.
        </p>
    </div>

    <form method='POST' action='/shorten' role='form' class="ts-shorten-panel">
        <div class="ts-panel-label">Paste a TeamStation URL</div>
        <label class="sr-only" for="link-url">Long URL</label>
        <input id="link-url" type='url' autocomplete='off'
            class='form-control long-link-input' placeholder='https://teamstation.us/meetings/...' name='link-url' required />

        <div class='row ts-options' id='options' ng-cloak>
            <p>Customize ending</p>

            @if (!env('SETTING_PSEUDORANDOM_ENDING'))
            {{-- Show secret toggle only if using counter-based ending --}}
            <div class='btn-group btn-toggle visibility-toggler' data-toggle='buttons'>
                <label class='btn btn-primary btn-sm active'>
                    <input type='radio' name='options' value='p' checked /> Public
                </label>
                <label class='btn btn-sm btn-default'>
                    <input type='radio' name='options' value='s' /> Secret
                </label>
            </div>
            @endif

            <div>
                <div class='custom-link-text'>
                    <span class='site-url-field'>{{env('APP_ADDRESS')}}/</span>
                    <input type='text' autocomplete="off" class='form-control custom-url-field' name='custom-ending' aria-label="Custom link ending" />
                </div>
                <div>
                    <a href='#' class='btn btn-success btn-xs check-btn' id='check-link-availability'>Check Availability</a>
                    <div id='link-availability-status'></div>
                </div>
            </div>
        </div>

        <div class="ts-form-actions">
            <input type='submit' class='btn btn-info' id='shorten' value='Shorten Link' />
            <a href='#' class='btn btn-warning' id='show-link-options'>Options</a>
        </div>
        <input type="hidden" name='_token' value='{{csrf_token()}}' />
    </form>
</section>

<section class="ts-detail-grid" aria-label="Shortener details">
    <div>
        <span>01</span>
        <strong>Meetings</strong>
        <p>Cleaner calendar and coordination links.</p>
    </div>
    <div>
        <span>02</span>
        <strong>Jobs</strong>
        <p>Readable job-share links for candidates and clients.</p>
    </div>
    <div>
        <span>03</span>
        <strong>Proof</strong>
        <p>Short links for case studies, pricing, and operating docs.</p>
    </div>
</section>
@endsection

@section('js')
<script src='js/index.js'></script>
@endsection
