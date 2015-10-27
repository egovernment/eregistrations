<div class="container" id="forgot-password-container">
	<div class="row">
		<div class="col-sm-offset-2 col-sm-7">
			<form action="/reset-password/" method="post" class="form-horizontal">
				<fieldset>
					<div class="form-group">
						<label for="email-input" class="col-sm-4 control-label">Correo electrónico:</label>
						<div class="col-sm-8">
							<input type="email" class="form-control" name="email" id="email-input">
						</div>
					</div>
					<div class="form-group">
						<label for="password-input" class="col-sm-4 control-label">Nueva contraseña:</label>
						<div class="col-sm-8">
							<input type="password" class="form-control" name="password" id="password-input" pattern="[\u0009 -\u2027\u2030-\uffff]*(?=[\u0009 -\u2027\u2030-\uffff]*\d)(?=[\u0009 -\u2027\u2030-\uffff]*[a-zA-Z])[\u0009 -\u2027\u2030-\uffff]*">
							<p class="hint">Introducir una nueva contraseña (mínimo 6 caracteres).</p>
						</div>
					</div>
					<div class="form-group">
						<label for="password-repeat-input" class="col-sm-4 control-label">Repetir contraseña:</label>
						<div class="col-sm-8">
							<input type="password" class="form-control" name="password-repeat" id="password-repeat-input" pattern="[\u0009 -\u2027\u2030-\uffff]*(?=[\u0009 -\u2027\u2030-\uffff]*\d)(?=[\u0009 -\u2027\u2030-\uffff]*[a-zA-Z])[\u0009 -\u2027\u2030-\uffff]*">
							<p class="hint">Repetir su nueva contraseña</p>
						</div>
					</div>
					<div class="form-group">
						<div class="col-sm-4 control-label">
							<input type="hidden" name="password-token" value="${ resetPasswordToken }" />
						</div>
						<div class="col-sm-8">
							<input type="submit" value="Salvar">
						</div>
					</div>
				</fieldset>
			</form>
		</div>
	</div>
</div>
