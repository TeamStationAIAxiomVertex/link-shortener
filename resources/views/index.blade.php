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

<section class="ts-pricing-model" aria-label="Hourly planning model">
    <div class="ts-pricing-main">
        <div class="ts-dark-label">Hourly planning model</div>
        <div class="ts-rate-line">
            <span>$20-$50</span><small>/hr</small>
        </div>
        <p>
            Monthly and annual planning numbers are calculated from the hourly rate using 173 average workable hours per month. The rate includes more than payroll: sourcing, evaluation, EOR, payroll, devices, MDM, security, oversight, and operating support.
        </p>
        <div class="ts-pricing-actions">
            <a class="ts-pricing-button ts-pricing-button-primary" href="https://drive.google.com/uc?export=download&amp;id=1DUDmOnsiz8R5bjWaaCNPwjvBI5BBMxt-" target="_blank" rel="noopener">
                Download enterprise pricing PDF
            </a>
            <a class="ts-pricing-button" href="/assets/diy-vs-deel-vs-teamstation-price-comparison.pdf" download>
                Download DIY vs Deel vs TeamStation comparison PDF
            </a>
        </div>
    </div>

    <div class="ts-pricing-side">
        <ul>
            <li>No separate sourcing vendor</li>
            <li>No separate EOR or payroll handoff</li>
            <li>No separate device, MDM, or security scramble</li>
            <li>No extra senior oversight layer to build from scratch</li>
        </ul>
        <div class="ts-rate-grid" aria-label="Monthly and annualized planning numbers">
            <div><span>$20/hr</span><strong>$3,460</strong><small>per month</small></div>
            <div><span>$30/hr</span><strong>$5,190</strong><small>per month</small></div>
            <div><span>$40/hr</span><strong>$6,920</strong><small>per month</small></div>
            <div><span>$50/hr</span><strong>$8,650</strong><small>per month</small></div>
        </div>
    </div>
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
