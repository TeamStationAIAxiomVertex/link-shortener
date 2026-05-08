<div class="ts-navbar-shell">
    <nav role="navigation" class="navbar navbar-default navbar-fixed-top ts-navbar">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-primary" aria-expanded="false" aria-controls="navbar-primary">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>

        <!-- Output sign in/sign out buttons appropriately -->
        <div class="navbar-header">
            <a class="navbar-brand ts-brand" href="{{ route('index') }}">
                <span class="ts-brand-mark">T</span>
                <span class="ts-brand-text">
                    <strong>{{env('APP_NAME')}}</strong>
                    <small>LINK ROUTING OS</small>
                </span>
            </a>
        </div>

        <ul id="navbar-primary" class="nav navbar-collapse collapse navbar-nav ts-nav-primary">
            <li><a href="{{ route('about') }}">About</a></li>

            @if (empty(session('username')))
                <li class="visible-xs"><a href="{{ route('login') }}">Sign In</a></li>
                @if (env('POLR_ALLOW_ACCT_CREATION'))
                    <li class="visible-xs"><a href="{{ route('signup') }}">Sign Up</a></li>
                @endif
            @else
                <li class="visible-xs"><a href="{{ route('admin') }}">Dashboard</a></li>
                <li class="visible-xs"><a href="{{ route('admin') }}#settings">Settings</a></li>
                <li class="visible-xs"><a href="{{ route('logout') }}">Logout</a></li>
            @endif
        </ul>

        <ul class="nav pull-right navbar-nav hidden-xs ts-nav-actions">
            <li class="divider-vertical"></li>

            @if (empty(session('username')))
                @if (env('POLR_ALLOW_ACCT_CREATION'))
                    <li><a class="ts-nav-link" href="{{route('signup')}}">Create Account</a></li>
                @endif

                <li class="dropdown">
                    <a class="dropdown-toggle ts-nav-cta" href="#" data-toggle="dropdown">Sign In <strong class="caret"></strong></a>
                    <div class="dropdown-menu pull-right login-dropdown-menu" id="dropdown">
                        <h2>Login</h2>
                        <form action="login" method="POST" accept-charset="UTF-8">
                            <input type="text" name="username" placeholder='Username' size="30" class="form-control login-form-field" />
                            <input type="password" name="password" placeholder='Password' size="30" class="form-control login-form-field" />
                            <input type="hidden" name='_token' value='{{csrf_token()}}' />
                            <input class="btn btn-success form-control login-form-submit" type="submit" name="login" value="Sign In" />
                        </form>
                    </div>
                </li>
            @else
                <div class='nav pull-right navbar-nav'>
                    <li class='dropdown'>
                    <a class="dropdown-toggle login-name ts-nav-cta" href="#" data-toggle="dropdown">{{session('username')}} <strong class="caret"></strong></a>
                        <ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu">
                            <li><a tabindex="-1" href="{{ route('admin') }}">Dashboard</a></li>
                            <li><a tabindex="-1" href="{{ route('admin') }}#settings">Settings</a></li>
                            <li><a tabindex="-1" href="{{ route('logout') }}">Logout</a></li>
                        </ul>
                    </li>
                </div>
            @endif
        </ul>
    </nav>
</div>
