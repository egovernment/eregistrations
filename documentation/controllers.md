# POST submissions controllers

## Introduction

Handling of POST submissions is configured with help of two generic utilities: [controller-router](https://github.com/medikoo/controller-router), [post-controller-router](https://github.com/medikoo/post-controller-router) and two handler modules, configured in mano, one for [client](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano/client/post-router.js) and one for [server](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano/server/post-router.js).

This document should complement documentation of above utilities, with information that's needed to configure controllers in eregistration applications.

## How to configure controllers

We configure controllers only in _controller_ folder of an [application](https://github.com/egovernment/eregistrations#definition-of-applications). Old way was to also add configurations in _client/controller_ and _server/controller_ that's no longer the case.

Additionally configuration for all controllers should be placed in one file (_index.js_), (not with separate file for each request)

### Route keys

Controllers are configured via routes configuration, where key is a path route for POST request, and value is controller configuration.

If path is static e.g. `/guide/` then key is `guide`, if path is dynamic, e.g. `/branch/9sdf323034/` (where second token is specific branch id), then key is mix of static string and content to be used for regular expression, in that case:
`branch/[0-9][0-9a-z]+`.

### Controller configuration options

#### validate
Optional. Defaults to common [validate](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano/utils/validate.js) logic.

#### submit
Optional. Defaults to common [submit](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano/utils/save.js) logic.

#### redirectUrl
Optional. Redirection url, if we want to switch interface to other page after successful submission.
This can also be a function, where we conditionally resolve to which url we want to redirect the user.

#### formHtmlId
Optional. If from is placed in a dialog (as e.g. login or inventory), or is in non initially visible part of a page (e.g. bottom of it), we should provide a html id of it. This it to assure that in legacy mode, after page reloaded user is presented again with form in front of him. (_#{formHtmlId}_ would be added to redirection url).

#### match
Should be provided when we deal with a dynamic key.  
`match` function would be called with tokens resolved from url. It should return _false_ if url seems malformed and doesn't address a valid entity. In other case _true_ should be returned.

Any resolved objects within `match` function, should be assigned on the context (`this`), that way they're accessible to `validate` and `submit` functions which will be called with same context.

--

All options apart of `match` (when we deal with dynamic key) are optional, if we don't plan to override any of it. We may make our configuration as:

```javascript
exports['some-action'] = true;
```

For good example of controller configurations check [Salvador's user role](https://github.com/egovernment/eregistrations-salvador/blob/master/user/controller/index.js)

### Server handled submissions

If given request is meant to be always processed by server (e.g. login, or payment processing) then additional separate configurations for it are placed in _client.js_ and _server.js_.

e.g. we may say to client, that this request should be processed remotely:

_client.js_
```javascript
exports['server-only-action'] = {
  remoteSubmit: true
}
```

#### remoteSubmit
If we pass _true_, handler proceeds with [default remote submit](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano/client/post-router.js#L19) logic. We can override that behavior, by passing our own function handler.

#### processResponse
Additionally we may provide special response handler. Normally application does nothing after server propagated request, but if we want to react to it in specific way, or need to parse message send from server, then we need to provide `processResponse` function.  
e.g. after login, we want to [wait for data sync and reload page](https://github.com/egovernment/eregistrations-lomas/blob/master/node_modules/mano-auth/controller/client/register-and-login.js#L4)


### Preprepared configurations

Thanks to them, we don't have to repeat same configuration across different applications

#### Public website controllers
[eregistrations/controller/public](https://github.com/egovernment/eregistrations/tree/master/controller/public) - Preconfigured _login, register, reset-password, request-reset-password_ controllers.  
It's important to note, that they assume new way of password hashing, and do not include client-side sha256 hash logic.
If you're system still needs those, then controllers need to be additionally tweaked.

#### Common user controllers
[eregistrations/controller/user](https://github.com/egovernment/eregistrations/tree/master/controller/user) - Common controllers for all apps when some kind of user is logged. It's about _profile_ submission and support for _login_ request, if for some reason logged-in user sees public website and tries to login to system.

#### Users Admin controllers
[eregistrations/controller/users-admin](https://github.com/egovernment/eregistrations/tree/master/controller/users-admin) - All controllers for Users Admin role

#### Meta Admin: Save translations controller
[eregistrations/controller/save-translations](https://github.com/egovernment/eregistrations/blob/master/controller/save-translations.js)

#### Generator of entity add/edit/delete controllers
[eregistrations/controller/generate-entities-controllers](https://github.com/egovernment/eregistrations/blob/master/controller/generate-entities-controllers.js).  
Example of usage -> https://github.com/egovernment/eregistrations-salvador/blob/master/user/controller/index.js#L48-L54

#### Generator of nested user routes
[eregistrations/controller/generate-nested-user-routes](https://github.com/egovernment/eregistrations/blob/master/controller/generate-nested-user-routes.js)
It's dedicated for _user-manager_ and _demo-user_ roles where we present user applications nested way

See example in Salvador's User Manager role -> https://github.com/egovernment/eregistrations-salvador/blob/master/user-manager/controller/client.js#L30-L36  
Generator is to be used separately in _client.js_ and _server.js_ files, and not to be used in _index.js_

#### Generator of nested official routes
[eregistrations/controller/generate-nested-official-routes](https://github.com/egovernment/eregistrations/blob/master/controller/generate-nested-official-routes.js)  
Dedicated for _demo-user_ which exposes official applications nested way

See example in Salvador's Demo User role -> https://github.com/egovernment/eregistrations-salvador/blob/master/demo-user/controller/client.js#L27-L37  
Generator is to be used separately in _client.js_ and _server.js_ files, and not to be used in _index.js_

## How to force application to use controllers configured new way

At this point _mano_ still by default expects old styles configuration. Therefore after configuring controllers new way, we need to introduce additional changes to make sure _mano_ switch to new way of routing:

1. Add `exports.useNewPostController = true` in _mano.js_ of application
2. Add `useNewPostController: true` in _client/program.js_ configuration for client-side
3. Do not configure `router.post` in client/program.js, but instead import controllers into new [postRouter](https://github.com/egovernment/eregistrations-salvador/blob/master/meta-admin/client/program.js#L36-L37)
