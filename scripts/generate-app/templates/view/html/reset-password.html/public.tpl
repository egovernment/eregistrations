<div class="content">
    <section class="dialog-body">
        <form id="reset-password-form" method="post" action="/reset-password/">
            <ul class="form-elements">
                <li class="dbjs-input-component input">
                    <label>
                        <span class="placeholder-fallback">${ _("Email") }</span>
                        <input type="email" required name="email" placeholder="${ _(" Email") }" />
                    </label>
                </li>
                <li class="dbjs-input-component input">
                    <label>
                        <span class="placeholder-fallback">${ _("New password") }</span>
                        <input type="password" required name="password" placeholder="${ _(" Password") }" />
                        <span class="error-message"></span>
                    </label>
                </li>
                <li class="dbjs-input-component input">
                    <label>
                        <span class="placeholder-fallback">${ _("Repeat password") }</span>
                        <input type="password" required name="password-repeat" placeholder="${ _(" Password") }" />
                        <span class="error-message"></span>
                    </label>
                </li>
                <li class="dbjs-input-component input">
                    <label>
                        <span class="placeholder-fallback">${ _("Repeat password") }</span>
                        <input type="hidden" name="password-token" value="${ resetPasswordToken }" />
                        <span class="error-message"></span>
                    </label>
                </li>
            </ul>
            <p><input type="submit" value="${ _("Save") }"></p>
        </form>
    </section>
</div>
