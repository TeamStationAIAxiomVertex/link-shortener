<footer class="ts-footer">
    <div class="container ts-footer-inner">
        <a class="ts-footer-brand" href="{{ route('index') }}">
            <span class="ts-brand-mark">T</span>
            <span class="ts-brand-text">
                <strong>{{env('APP_NAME')}}</strong>
                <small>LINK ROUTING OS</small>
            </span>
        </a>

        <nav class="ts-footer-nav" aria-label="Footer navigation">
            <a href="{{ route('about') }}">About</a>
        </nav>
    </div>
</footer>
