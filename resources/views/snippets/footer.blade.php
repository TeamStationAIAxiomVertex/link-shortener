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
            @if (empty(session('username')))
                @if (env('POLR_ALLOW_ACCT_CREATION'))
                    <a href="{{route('signup')}}">Create Account</a>
                @endif
                <a href="{{ route('login') }}">Sign In</a>
            @else
                <a href="{{ route('admin') }}">Dashboard</a>
                <a href="{{ route('logout') }}">Logout</a>
            @endif
        </nav>
    </div>
</footer>
