<div class="ts-navbar-shell">
    <nav role="navigation" class="navbar navbar-default navbar-fixed-top ts-navbar">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-primary" aria-expanded="false" aria-controls="navbar-primary">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>

        <div class="navbar-header">
            <a class="navbar-brand ts-brand" href="{{ route('index') }}">
                <span class="ts-brand-mark">
                    <img src="/img/teamstation-logo.png" alt="" aria-hidden="true" />
                </span>
                <span class="ts-brand-text">
                    <strong>{{env('APP_NAME')}}</strong>
                    <small>LINK ROUTING OS</small>
                </span>
            </a>
        </div>

        <ul id="navbar-primary" class="nav navbar-collapse collapse navbar-nav ts-nav-primary">
            <li><a href="{{ route('about') }}">About</a></li>
        </ul>

        <ul class="nav pull-right navbar-nav hidden-xs ts-nav-actions">
            <li class="divider-vertical"></li>
        </ul>
    </nav>
</div>
