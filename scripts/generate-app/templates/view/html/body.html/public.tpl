<!-- Core content of a <body> element. It's about content that will be visible/accessible in all
public pages (e.g. header, footer, login/register/request-password modals -->

<!-- Login modal dialog -->
<div class="modal fade" id="login" tabindex="-1" role="dialog" aria-labelledby="loginLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header text-white bg-red">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="loginLabel">${ _("Log in") }</h4>
			</div>
			<div class="modal-body">
				<form id="login-form" method="post" action="/login/">
					<div class="form-group">
						<label for="email">${ _("Email") }</label>
						<input type="email" class="form-control" required name="email" placeholder="${ _("Email") }" />
					</div>
					<div class="form-group">
						<label for="password">${ _("Password") }</label>
						<input type="password" class="form-control" required name="password" placeholder="${ _("Password") }"
							pattern="${ passwordPattern }" />
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<input type="submit" value="${ _("Sign in") }" class="btn btn-default btn-sm">
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<small class="text-left">${ _("No account?") } <a href="" data-dismiss="modal" data-toggle="modal" data-target="#register">${ _("Create an account") }</a><span> | </span>
			<a href="" data-dismiss="modal" data-toggle="modal" data-target="#reset-password">${ _("Reset password") }</a></small>
			</div>
		</div>
	</div>
</div>

<!-- Register modal dialog -->
<div class="modal fade" id="register" tabindex="-1" role="dialog" aria-labelledby="registerLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header text-white bg-red">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="registerLabel">${ _("Create your account") }</h4>
			</div>
			<div class="modal-body">
				<form id="register-form" method="post" action="/register/">
					<div class="form-group">
						<label for="User#/firstName">${ _("First name") }</label>
						<input name="User#/firstName" class="form-control" type="text" placeholder="${ _("First name") }">
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<label for="User#/lastName">${ _("Last name") }</label>
						<input name="User#/lastName" class="form-control" type="text" placeholder="${ _("Last name") }">
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<label for="User#/email">${ _("Email") }</label>
						<input name="User#/email" class="form-control" type="email" placeholder="${ _("Email") }">
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<label for="User#/password">${ _("Password") }</label>
						<input name="User#/password" class="form-control" type="password" placeholder="${ _("Password") }"
							pattern="${ passwordPattern }" />
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<label for="password-repeat">${ _("Repeat password") }</label>
						<input type="password" class="form-control" name="password-repeat" required placeholder="Repeat password"
							pattern="${ passwordPattern }" />
						<span class="error-message"></span>
					</div>
					<div class="form-group">
						<input type="submit" value="${ _("Create account") }" class="btn btn-primary btn-sm">
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<small class="text-left">${ _("Already has account?") } <a href="" data-dismiss="modal" data-toggle="modal" data-target="#login">${ _("Log in") }</a><span> | </span>
			<a data-dismiss="modal" href="/reset-password"> ${ _("Reset password") }</a></small>
			</div>
		</div>
	</div>
</div>


<!-- Reset password modal dialog -->
<div class="modal fade" id="reset-password" tabindex="-1" role="dialog" aria-labelledby="resetLabel" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header text-white bg-red">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="resetLabel">${ _("Reset password") }</h4>
			</div>
			<div class="modal-body">
				<form id="reset-password-form" method="post" action="/request-reset-password/">
					<p class="success-message"></p>
					<div class="form-group">
						<label for="email">${ _("Email") }</label>
						<input type="email" required name="email" placeholder="${ _("Email") }" class="form-control">
					</div>
					<div class="form-group">
						<input type="submit" value="${ _("Reset") }" class="btn btn-default btn-sm">
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<!-- Top header -->
<nav id="mainnav" class="navbar navbar-transparent navbar-large navbar-fixed-top">
	<div class="container">
		<div class="row">
			<div class="col-sm-4 col-md-4">
				<div class="navbar-header">
					<button id="topMenuButton" type="button" class="navbar-toggle collapsed">
						<span class="sr-only">Toggle navigation</span>
						<span class="nclo1 icon-bar"></span>
						<span class="nclo2 icon-bar"></span>
						<span class="nclo3 icon-bar"></span>
					</button>
				</div>
			</div>
			
			<div class="col-sm-8 col-md-8">
				<div class="collapse navbar-collapse" id="topnav">
					<ul class="nav navbar-nav navbar-right">
						<li><a href="" data-toggle="modal" data-target="#login"><span class="navbar-btn btn btn-default btn-sm">${ _("Log in") }</span></a></li>
						<li><a href="" data-toggle="modal" data-target="#register"><span class="navbar-btn btn btn-primary btn-sm">${ _("Create your account") }</span></a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<div class="container" id="sectionNav"></div>
</nav><!-- end navbar top -->

<!-- Prev/next buttons -->
<a id="navPrev" href="#" class="nav-prev transition hidden hidden-xs" data-toggle="tooltip" data-placement="right" title=""><i class="fa fa-chevron-left"></i></a>
<a id="navNext" href="#" class="nav-next transition hidden hidden-xs" data-toggle="tooltip" data-placement="left" title=""><i class="fa fa-chevron-right"></i></a>

<!-- Black curtain behind modal dialoges -->
<div class="modal-courtain"></div>

<!-- Main container -->
<main id="content">
		<!-- To be filled by child views -->
</main>

<div class="container logo-rows"></div>

<!-- Footer -->
<footer class="footer">
	<a href="http://unctad.org" target="_blank"><img src="${ stRoot }img/logos/logo-unctad-transparent.png"/></a>
	<a href="http://cooperation.mae.lu/fr/" target="_blank"><img src="${ stRoot }img/logos/luxembourg-280-60-dark.gif"/></a>
</footer>

<script>
jQuery.noConflict();

jQuery( document ).ready(function( $ ) {

	$('[data-toggle="tooltip"]').tooltip();

	$('#topMenuButton').click(function(e) {
		if($(this).hasClass('opened')) {
			$(this).removeClass('opened');
		}else{
			$(this).addClass('opened');
		}
		$('#topnav').collapse('toggle');
	});

	$('#topnav li a').click(function(e) {
		if($('#topnav').hasClass('in')) {
			if($('#topMenuButton').hasClass('opened')) {
				$('#topMenuButton').removeClass('opened');
			}else{
				$('#topMenuButton').addClass('opened');
			}
			$('#topnav').collapse('toggle');
		}
	});
});
</script>
