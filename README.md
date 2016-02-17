# eRegistrations
## Base framework for eRegistrations applications

Table of contents:

1. [Introduction](#introduction)
    1. [Language](#language)
    1. [Modules system](#modules-system)
    1. [Quality maintenance](#quality-maintenance)
1. [Architecture](#architecture)
    1. [Low-level utilities](#low-level-utilities)
    1. [Data modeling](#data-modeling)
    1. [Views & templates](#views--templates)
    1. [Legacy browsers handling](#legacy-browsers-handling)
    1. [Authentication](#authentication)
    1. [Email messaging](#email-messaging)
    1. [Internationalization](#internationalization)
    1. [Unit tests](#unit-tests)
    1. [Glue (Mano)](#glue-mano)
        1. [Definition of applications](#definition-of-applications)
        1. [Organization within application folder](#organization-within-application-folder)
        1. [Form submission Controllers](#form-submission-controllers)
        1. [Server-side setup and initialization](#server-side-setup-and-initialization)
            1. [Initialization](#initialization)
            1. [Data persistent layer](#data-persistent-layer)
            1. [HTTP Server](#http-server)
            1. [Client-side program](#client-side program)
    1. [Alphabetical list of all core packages](#alphabetical-list-of-all-core-packages)
1. [Organization of eRegistrations logic](#organization-of-eregistrations-logic)
1. [Development (work) organization](#development-work-organization)

## Introduction

This documentation is about all technical aspects of the framework, which understanding is important to develop eRegistrations systems. It does not focus on end user perspective of application.

### Language

eRegistrations is full-stack JavaScript project, that means both client and server side logic is programmed in JavaScript.

Base for our code is ECMAScript 5 edition. It's very important distinction from popular tools of web today, which (in due to provide support for IE6-8 browsers) are based on ECMAScript 3.

We provide [Single-page application](http://en.wikipedia.org/wiki/Single-page_application) for modern browsers, and having Node.js we generate static pages on server-side for browsers of old web (or search engine spiders).

Ideally our full stack JavaScript application can be fully functional in a browser with JavaScript support turned off.

If you're not familiar with ES5, it's very important that you know all the differences. In eRegistrations, we use ES5 at it's best. We use all Array iterator methods (`forEach`, `some` etc.), we usually don't use  `for` or `for in` construct, as they're not that convenient. We use _getters_, _setters_ and _descriptors_ for object modeling. We also write all of our code in _strict_ mode.

See following:
* http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
* http://www.slideshare.net/kangax/say-hello-to-ecmascript-5

It's important to add that idea is to write JavaScript in most _natural_ for JavaScript way. JavaScript is neither strictly OOP or strictly functional language, it's somewhere between. It's best to take all that's suitable from both worlds, but without getting too far. We don't struggle to write JavaScript as it's Java, and we don't struggle to write it as it's Haskell.

Similar approach applies also to all other JavaScript API's. We use native HTML5 for things that we used to program with JavaScript in old days. We configure animations with CSS3 transitions (not with JavaScript). Old browsers won't get that, but as far as it's just enriching sugar, it's not important. There's no need to provide fireworks to e.g. IE7 or IE8. Instead [we care about progressive enhancement](http://jakearchibald.com/2013/progressive-enhancement-still-important/) and assure that application is accessible and fully functional in old browsers.

### Modules system

We use Node.js style modules system. It is best modules system that JS currently has, with [npm](https://npmjs.org/) and [semantic versioning](http://semver.org/) on board we're free of dependency resolution problems that are eminent to corresponding (and already powerful) systems in other popular languages.

_If you're more familiar with AMD/Require.js, you need to be aware that Require.js is very different and has not much to do with `require` as introduced earlier with CommonJS (then Node.js). In comparison with Node.js, AMD cross-modules dependency resolution style is quite limited and unnecessary complex. Same when speaking of lazy loading, which should not be done as low level as per Node.js module. See [comparison section in Webmake documentation](https://github.com/medikoo/modules-webmake#comparison-with-other-solutions)_

Node.js modules style is also close to native JavaScript modules that should have first specified version by end of 2013. It's likely, that at some point, when standard will be coined we will switch from Node.js modules to native ES6 modules.

We use [Webmake](https://github.com/medikoo/modules-webmake#modules-webmake) to bundle Node.js modules for browser.

Modularization of eRegistrations application is very fine-grain, e.g. Lomas user application is bundled out of over 400 individual JavaScript files (modules). When designing modules we try to follow [Unix philosophy rules](http://en.wikipedia.org/wiki/Unix_philosophy).

All modules/packages we use are explained in recommended reading order in [Architecture](#architecture) section. Later when you are more familiar with how things works, you can refer to [list of all modules in alphabetical order](#alphabetical-list-of-all-core-packages).

### Quality maintenance

We guard code quality with [XLint](https://github.com/medikoo/xlint). It's actually just CLI for linter of choice, which allows us to keep all settings in external and single configuration file _(.lint)_. Additionally it understands _.gitignore_ rules and provides other nice goodies like live console.

Our XLint setup is configured to lint code with latest version of [JSLint](http://www.jslint.com/) that is additionally modified up to our needs.

To see generated report run:

	$ npm run lint
	
Be sure to run it once you checkout the project. Normally you should be presented with `100.00% OK` message. If you're on Windows and instead see a lot of whitespace errors, it means you need to make sure your editor or [git itself](https://help.github.com/articles/dealing-with-line-endings#platform-windows) doesn't update line endings for you. We strictly use unix style line endings in our code, and all your tools must play nice with that.

If you want to access live console that observes current state of files (shows and clears errors as they're introduced) run:

	$ npm run lint-console

Best way to work with XLint, is to either run above console in some constantly visible window, or integrate it with editor of your choice.

#### XLint integration with Sublime Text

There's a prepared [XLint build system for Sublime Text](https://github.com/medikoo/xlint-sublime), to have it working just follow instructions at its repository.

It works by re-running lint command on each file save and showing output log in Sublime's console.

#### XLint integration with WebStorm

The are two ways:

##### Integrate as Google Closure linter (for v7 versions of WebStorm)

Go to _Preferences -> JavaScript -> Code Quality Tools -> Closure Linter_ enable it and choose `bin/lint-webstorm` (on Windows: `bin/lint-webstorm.cmd`) as _Closure Linter executable file_ and `bin/lint-webstorm.conf` as _Configuration file_


##### Integrate as Google Closure linter (for v8+ versions of WebStorm)

Go to _File -> Settings -> JavaScript -> Code Quality Tools -> Closure Linter_ enable it and choose `bin/lint-webstorm` (on Windows: `bin/lint-webstorm.cmd`) as _Closure Linter executable file_ and `bin/lint-webstorm.conf` as _Configuration file_

##### Integrate as external tool

Go to _Preferences -> External Tools_ and add new tool with following settings:
* __Program__: `npm` (on Windows put `npm.cmd`)
* __Parameters__: `run lint-log-console`, it's different flavor of live console than one mentioned above. This one doesn't try to alter perviously outputed content, and as control characters doesn't work in WebStorm console, it's much better to use that version.
* __Working directory__: `$ProjectFileDir$` (assuming that root directory of the repository matches root directory of WebStorm project).

After having that, we can run it from a menu and place it at chosen editor side.

Mind that if there are no lint errors in a project, at initial run there will be no output until all project files are validated (10-20 seconds), that's expected behavior.

#### XLint integration with Emacs

For all the hardcores. This one provides error reporting as you write, directly in the editor. Setup stands on _flymake-mode_, please activate it for all JavaScript files, and use following configuration (be sure to replace `$PROJECT_PATH` with valid one).

```lisp
(when (load "flymake" t)
	(defun flymake-jslint-init ()
		(let* ((temp-file (flymake-init-create-temp-buffer-copy
						'flymake-create-temp-inplace))
				(local-file (file-relative-name
						temp-file
						(file-name-directory buffer-file-name))))
			(list
				"$PROJECT_PATH/node_modules/xlint/bin/xlint"
				(list
					"--linter=$PROJECT_PATH/node_modules/xlint-jslint-medikoo-mod/index.js"
					(concat "--realFilename=" buffer-file-name)
					"--terse" "--no-cache" temp-file))))

	(setq flymake-err-line-patterns
		(cons '("^\\(.*\\):\\([[:digit:]]+\\):\\([[:digit:]]+\\):\\(.*\\)$"
				1 2 3 4)
			flymake-err-line-patterns))

	(add-to-list 'flymake-allowed-file-name-masks
		'("\\.js\\'" flymake-jslint-init))

	(require 'flymake-cursor)
)
```

## Architecture

Before we dive into most important modules that deal with models, views, server and other core of application, let's look at low-level utilities/helpers that are used basically everywhere.

### Low-level utilities

#### [es5-ext](https://github.com/medikoo/es5-ext) - ECMAScript 5 extensions

It's _lang_ package, serves similar role as very popular [underscore](http://underscorejs.org/) project in ES3 world.
Difference is that es5-ext stands on ES5, much closer follows language conventions and each utility function is served as individual module . All modules are documented in [es5-ext documentation](https://github.com/medikoo/es5-ext), please get accustomed with what it offers. If it misses something valuable, we accept pull requests (but to save your time, it's wise to discuss such addition first).

#### [event-emitter](https://github.com/medikoo/event-emitter) - Event emitter

Cross-enviroment event-emitter solution. It backs many API's that have more custom role, all dbjs objects, promises, mutables, sets and hell of others. It's basic, fast, simple and extremely useful, refer to [documentation](https://github.com/medikoo/event-emitter) for details.

#### [mutable](https://github.com/medikoo/mutable) - Mutable interface

It's new thing, that is not yet as widespread as it will be. Idea is to have common interface for value wrapper that emits _change_ events when value is changed, and which provides access to value via `wrapper.value` and optionally allows to set value with `wrapper.value = newValue`.

It's scheduled to be heavily used in view templates, where we declaratively define _living_ page view. e.g.:

```javascript
_if(greater(user._weight, 100), "You're fat!", " You look good!");
```

Where `user._weight` implements mutable, and return value of `greater` and `_if` is also a mutable.

See [documentation](https://github.com/medikoo/mutable) for more info

Note for OOP purists: Saying it's an interface, can be confusing as project offers also working implementation. Thing is that what's included is just default (basic) implementation for JavaScript. There are mutable implementations that implement behavior in own custom way and are passed just through [mutable marker](https://github.com/medikoo/mutable/blob/master/_mark.js) so they're recognized as mutables.

#### [next-tick](https://github.com/medikoo/next-tick) - Next tick for any environment

Cross environment nextTick polyfill, it's used in modules which we use both in browser and node.
Refer to [documentation](https://github.com/medikoo/next-tick).

If you're not familiar with _next tick_ concept, be sure to read about it in [node documentation](http://nodejs.org/api/all.html#all_process_nexttick_callback)


#### [memoizee](https://github.com/medikoo/memoize) - Memoize/cache solution

Very powerful and efficient memoize/cache solution that we use in many modules. Refer to [documentation](https://github.com/medikoo/memoize) for all details

#### [deferred](https://github.com/medikoo/deferred) - Modular and fast Promises implementation

Aid for asynchronous programming, it's used heavily with scripts written for _node_ and in less extent in browser scripts.

Promise concept got attention in last months. If you haven't read about please refer to [deferred documentation](https://github.com/medikoo/deferred), and be sure to check various articles that came out recently.

I also tried to coin the point of it in [presentation some while ago](http://www.medikoo.com/asynchronous-javascript/)

#### [set-collection](https://github.com/medikoo/set-collection) Set collection with extensions

If you're not familiar with `set`, Set is unordered collection of unique values, where value is any JavaScript value. We use `sets` heavily in [DBJS](#dbjs---httpsgithubcommedikoodbjs) they serve for multiple values and various object collections.

This project should be (and will be) split into two, implementation of `set` up to ECMASCript 6 proposal, and `set-ext` (extensions for `set`). Currently it's as [mutable](#mutable---mutable-interface), in immature state, and is subject to many changes.

#### [dom-ext](https://github.com/medikoo/dom-ext) - DOM Utilities (extensions)

Equivalent of [es5-ext](es5-ext---ecmascript-5-extensions) for DOM API. List of all functions is currently missing in main doc, but they can be read from list of files in corresponding folders.

### Data modeling

Data modeling stands on most powerful and most sophisticated part of the system. We use [DBJS](https://github.com/medikoo/dbjs) to handle all our data modeling needs. __It's very important that you read [its documentation](https://github.com/medikoo/dbjs)__ to see how engine is organized, how to define data models and how to work with data instances.

DBJS is technically just in-memory database, for persistent layer currently we just put all data into MongoDB, and retrieve that on initialization. It is not effective and scalable approach when dealing with large amounts of data, but that's temporary solution. Plan for next months is to upgrade DBJS so it works with [LevelDB](http://dailyjs.com/2013/04/19/leveldb-and-node-1/) and is accompanied by both lazy loading and good scalability.

After you get familiar with how DBJS works, be sure to check also following projects:
* [DBJS-EXT](https://github.com/medikoo/dbjs-ext) - provides common extensions to basic DBJS types.
* [DBJS-DOM](https://github.com/medikoo/dbjs-dom) - provides two-way DOM data bindings that we use with DOMJS to generate views of application.

### Views & templates

#### Template language

The common way across frameworks is to write HTML strings, concat them and inject via innerHTML.

There are few valid reasons for that. Firstly, it's what we're used to, in old days we served static HTML pages to browsers, that's how web applications where build and served. Other reason is that HTML is convenient and readable format, and finally to work with plain HTML is especially important for designers or front-end developers which are usually not familiar with _server-side_ language.

The problem is that for SPA apps, where we need to configure a lot of dynamic behaviors, defining view with HTML started to be a limited approach. Technically we write HTML, concat it, inject into DOM, and then get elements from DOM to do further configuration. 
This closed circle of serialization and deserialization limits and makes our work more difficult. This problem was also [well described by Jed Smith](http://www.youtube.com/watch?feature=player_detailpage&v=_EsgFWU-xwU#t=573s), who is the author of [DOMO](https://github.com/jed/domo), simple library that stands on same principle as DOMJS we use: 

This is the reason in eRegistrations we use not common approach, but instead build DOM directly, for that we use [DOMJS](https://github.com/medikoo/domjs) engine which allows us to do it in most straightforward and readable way.

Remaining question is, maintainability of DOMJS structures by front-end devs and designers. First thing that we need to acknowledge, DOMJS is plain JavaScript, and that's the language any front-end developer is familiar with. It means we shouldn't treat it as blocker. In first eRegistrations projects we already have two front-end developers working with that and they seem to do well by introducing and editing HTML (really DOM) for existing pages.

Still in case of static content (e.g. pages for public webste), it may be preferable to maintain templates as plain HTML, for that [our view engine supports also plain HTML injection](#defining-views-with-plain-html) and as long as there's no need to introduce any dynamic behaviors it's best way to go.

##### Batch conversion of HTML into DOMJS
If you need to convert large portions of HTML into DOMJS, doing such by hand can be timetaking task, for that there's HTML -> DOMJS converter, which you  can use from the shell.

**Note: it needs additional `jsdom` package installed:**

    $ npm install jsdom

Run converter with following command:

    $ node node_modules/domjs/bin/html-to-domjs --output=output.js input.html

#### View files organization and URL routing

All view files are grouped in _view_ folder (refer to [organization](#applications-and-files-organization) section).

Each application has individual view folder, and has individual URL routing. View and URL trees are independent of each other, just mapped (node to node) for succesful routing.

##### Example of URL tree in Lomas user application:
<img src="http://medyk.org/ereg-url-tree.png" />

##### Example of View tree:
<img src="http://medyk.org/ereg-view-tree.png" />

If you look at the diagram of View tree, and at individual files in Lomas project, you'll see that each view is described by differences against it's parent. Currently it's in __routes.js_ file where it's decided which view descends from which. Differences are described by declaration of content for element of given id, e.g.:

```javascript
exports.main = function () {
  // Replace content of #main element with following:
  h1("New Main header");
  p("New main content");
};

exports.footer = function () {
  // Replace content of #footer element with following:
  p("New footer content");
};
```

We can also define new values for element attributes, and there's special handling for classes, e.g. in following we make sure that for #nextStepLi element class `active` was added.

```javascript
exports.nextStepLi = { class: { active: true } };
```

If we need to define both attributes and new content for given element, then we provide new content via _''_ (empty string) property _(it's weird solution and is subject to change)_:

```javascript
exports.nextStepLi = {
  class: { active: true },
  '': function () {
    // new content for element
  }
};
```

##### URL to View mapping

As it was already mentioned URL tree is mapped to View tree. It is currently done in __routes.js_ file, but in future such mapping will be resolved from organization of file tree. In above (Lomas) example following mapping was made (view -> url):

* index.js -> /
* otras-caracteristicas.js -> /otras-caracteristicas/
* ingrese-sus-datos.js -> /ingrese-sus-datos/
* representante/index.js -> /representante/:id/
* documentos.js -> /documentos/
* envie.js -> /envie/
* perfil.js -> /perfil/

##### Defining views with plain HTML

If we deal with static HTML and we prefer maintain it as such. We can define our views with HTML.

Instead of:
```javascript
exports.main = function () {
  p("DOM injection");
};
```

We can do:
```javascript
exports.main = '<p>Plain HTML injection</p>';
```

and as [Webmake reads also plain .html files](https://github.com/medikoo/modules-webmake#working-with-html-and-css)
we can also keep our HTML in dedicated files:

_main-body.html_
```html
<p>Plain HTML</p>
```

_template.js_
```javascript
exports.main = require('./main-body');
```

We can also mix DOMJS with plain HTML:
```javascript
exports.main = function () {
  p("DOM injection");
  html('<p>Plain HTML injection</p>');
};
```

or:

```javascript
exports.main = function () {
  p("DOM injection");
  html(require('./main-body'));
};
```

###### Plain HTML style guide

Plain HTML style is not guarded with any sophisticated lint check as JavaScript files. Still when writing it, to assure long-term and easy maintenance, we should stick to some good practices:

1. Let's define all element names and attributes lower-case and wrap attribute values with double quotes:  
Ok: `<div id="my-div"></div>`  
Not ok: `<DIV ID='my_div'></DIV>`
1. Do not inject inline styles, either via `style` attributes (e.g. `style="margin-top:10px"`) or `<style>` elements. Styles should be configured only in dedicated CSS files.
1. Reference all assets with absolute urls:  
Ok: `<img src="/images/xxx.png" />`  
Not ok: `<img src="../images/xxx.png" />`
1. Do not configure empty url's in links as `<a href="#">`. They make url's dirty, and on reload many browsers do not refresh assets if URL includes `#`. If you don't want the link to link anywhere just omit `href` attribute (just do `<a>`), or if it's placeholder for not yet existing url, make it empty: `<a href="">` it will be clean and will have same effect.
1. All URL's referenced in href needs to end with `/`.  
Ok: `href="/guide/"` or if we have query `href="/guide/?foo=bar"` or hash `href="/guide/#tab"`    
Not ok: `href="/guide"`  
1. Do not include any inline scripts, or reference JavaScript functions in HTML attributes. We use plain HTML only for static content. If we need some dynamic handling, we should use DOMJS.  
The only dynamic behavior that is Ok to use in plain HTML is one which we can configure via [mano-legacy/live](https://github.com/egovernment/eregistrations#preconfigured-live-configuration) with plain classes or `data-*` attributes.

#### Legacy browsers handling

As it was noted in [language](#language) section, we do JavaScript for modern browsers, and serve static pages generated on server-side for others. Ideally we shouldn't deal with any JavaScript written for older engines. Still to assure that website is fully functional, and that user experience is OK we may have a need to define few dynamic behaviors for old engines.

It's important to agree that __JS aid for old browsers should be as minimal as possible__. It's just about provision of show/hide logic to elements that are changed not by url changes but by button clicks (e.g. tabs) and some UX improvements like introducing date-picker for date inputs.

Other important rule is that we don't double implementation, and not write same functionalities twice differently for modern and differently old browsers. If something is definitely needed for old browsers, we're implementing it so it runs for old, and run it also in modern engines. In current setup of eRegistrations systems all legacy code is also run in modern engines.

##### JavaScript code conventions for old engines:

We base it on ECMAScript3, and use solutions that works in all browsers natively back to IE6. We don't use array iterators but instead rely on `for` and `for..in` loops. We find DOM elements by their _id_'s, eventually by their _tag_ names (via `getElementsByTagName`), usually we're after configuration of very specific and simple behaviors and we don't need on-board any custom selector engine for that.


##### Predefined generic modules

`mano-legacy` is dedicated package where we keep all reusable and generic modules which we can use through out the system.

For each application we configure what we need in `app-folder/client/legacy.js`, we do it in same Node.js modules style. Having that, system generates bundle out of `legacy.js` content and loads it with application (in modern browser it's loaded right before main application).

`mano-legacy` exposes `$` variable on global namespace (`window` object), through which all required utils are accessible. `$` is not only _set_ of utils but also a function which serves as a shortcut for `document.getElementById`. Therefore usually you find DOM elements via `$('element-id')`.

Currently some behaviours (those required from `mano-legacy/element#`) are set directly on elements that are returned from (or passed through) `$` function, but this is subject to change, and in near future all will be done through functions set on `$`.

You can check list of all modules in `mano-legacy` project. Explanation of some that are often used:

###### element#/class

Provides `el.addClass`, `el.removeClass`, `el.toggleClass` and `el.hasClass` for elements

###### element#/event

Provides `el.addEvent`, `el.removeEvent` through which we can assign DOM events, additionally `$.preventDefault(event)`, `$.stopPropagation(event)`

###### element#/get-by-class

Provides `el.getByClass(name, className)`, get all descendant elements of given _name_ having given _class_. It's to be used, when we need something more than `getElementById` or `getElementsByTagName`.

###### element#/toggle
Provides `el.exclude` (removes element from document), `el.include` (puts element back), `el.toggle(true|false)` if argument is true runs `include` if false `exclude`

###### on-env-update
Provides `$.onEnvUpdate(el, fn)` - Through that we configure given function to be run whenever internal environment of provided DOM element has been changed. Usually we pass `form` as an element, and function is run whenever any value of form was changed. This is used when we want to react _live_ to `<form>` changes, and change some other statuses on page. in eRegistrations project we update Guia page state with that.

###### dbjs-form-fill

Provides `$.onEnvUpdate(obj, form)` - Fills given object with values read from given form. We use it with objects that resembles DBJS model in legacy logic.

###### select-match

Provides `$.selectMatch(select, map)`. In some cases we need to show some controls only if select is selected with given value. This is the function that configures such behavior. We provide select element, and map describing which elements should be shown if given value is selected (if value is not selected they're automatically hidden).

###### radio-match

Provides `$.radioMatch(container, name, map)`. Same as `select-match` but for radios. In that case we need to provide the _container_ that holds all radio inputs, _name_ of radio inputs we're after, and same _map_ as we provide to `selectMatch`.

###### tabs

Dynamic tabs configuration.

First decide whether you really want to configure tabs with this solution. If they're going to switch main content of a webpage, then you should configure them with plain views and plain urls. Do not use this module for that.

If however tabs that you want to configure doesn't change main content, but rather content displayed aside, then this solution is good choice.

To use tabs module, you need to build HTML structure and configure basic CSS on your own.
Below it's example of such configuration.

HTML:
```html
<ul class="tabs" id="some-tabs">
  <li><a href="#one">One</a></li>
  <li><a href="#two">Two</a></li>
  <li><a href="#three">Three</a></li>
</ul>
<div class="tabs-content">
  <div id="one" class="active">… One content …</div>
  <div id="two">… Two content …</div>
  <div id="three">… Three content …</div>
</div>
```

CSS:
```css
div.tabs-content > div { display: none; }
div.tabs-content > div.active { display: block; }
```

JavaScript:

```javascript
$.tabs('some-tabs'); // Pass id to tabs navigation bar
```

Tab content that needs to be switched is found by parsing element ids out of link `href` attributes.
Then internal logic just switches `active` class across content containers. It's as simple as that.

If you'd like to use this solution in few places, or you want to use tabs in plain HTML templates, you can configure them through `live` functionality. See [Preconfigured live configuration](#preconfigured-live-configuration) section for more information on how it works. Below setup will run`$.tabs` configuration on all `ul` elements with `tabs` class.

```javascript
$.live('ul', 'class', 'tabs', $.tabs);
```

##### How to configure behaviors for legacy layer.

There are few methods.
First most basic is to provide it via script elements in DOMJS template:

```javascript
form({ id: 'my-form' }, '… some content …');
script(function () {
   // Code run in both modern and legacy engines
   var form = $('my-form'); // Get form element
});
```

Both template script and content of function passed to `script` looks as one environment, but mind, that __script function is serialized to string, injected as content of script element, and then run by the browser__ as regular _script_. Therefore at execution time no outer variables are visible to function defined in `script`. Body of function is additionally wrapped within immediately executed function (so we work in local scope, not directly in global), and is configured to run in _strict_ mode (of course that affects only modern browsers).

If we want to pass some values from template scope to script function, we can do it following way:

```javascript
script(function (userId, listOfTokens) {
   // Code run in both modern and legacy engines
   var form = $('my-form'); // Get form element
}, user._id_, ['one', two', three']);
```

Mind that arguments are also serialized to strings, and then deserialized when browser executes script. Therefore you can only pass serializable properties (typical primitive values, plain objects, arrays), but you cannot pass DBJS objects or other custom objects as they are (they're anyway cannot be provided to legacy side via static HTML generation).

So this is the most straight-forward way, let's talk about more options.

##### `legacy` shortcut

If we're just after running simple legacy function, e.g. `$.selectMatch`, normal way through `<script>` it would look like:

```javascript
script(function (selectId) {
  $.selectMatch(selectId, map);
}, select.id);
```

There's dedicated `legacy` shortcut, that allows us to configure same in shorter manner:

```javascript
legacy('selectMatch', select.id, map);
```

It's has exactly same effect as `<script>` version.

##### Preconfigured _live_ configuration

Other option, which suits some (repeated) cases better, is to configure within`legacy.js` that all elements of given _name_ and given _class_ should be configured with given behavior. We have (not mentioned yet) `mano-legacy/live` for that.

Concept is similar to one known from jQuery.live, difference is that it's not about running task on specific event, but once and right when element of given characteristics appears in DOM, which is much more desirable for some cases.

This is the way we configure masks for text inputs in eRegistrations. Snippet from legacy.js:

```javascript
require('mano-legacy/input-mask');
live.add('input', 'data-mask', $.inputMask); // runs $.inputMask on all input elements that have data-mask attribute
```

Configuration for `live` can be added in three custom levels:
* `live.add('div', fn)` - _fn_ run on all div elements
* `live.add('div', 'title', fn)` - _fn_ run on all div elements that have _title_ attribute
* `live.add('div', 'class', 'tabs', fn)` - _fn_ run on all div elements that have _tabs_ class


#### Authentication

Each user that wants to login into own eRegistrations panel is authenticated with _email_ and _password_.

There's dedicated `mano-auth` package (see _node\_modules/mano-auth_ ) that implements all authentication logic and provides necessary controllers that are called on submit of _register_, _login_ and _changePassword_ forms.

##### Password security

Password is salted with email and hashed with _sha256_ on client-side and in that form it is send to the server, then server salts and hashes it again with more sophisticated [bcrypt](http://en.wikipedia.org/wiki/Bcrypt) algorithm and in that form password is persistently saved on a server.

When password comes from submission done in old browser, then it comes in plain form to the server. Server then does both, hashes password with sha256 (done with same modules as in modern browsers on client-side) and then bcrypt.

See following, for reasoning after bcrypt -> http://codahale.com/how-to-safely-store-a-password/

#### Email messaging

Our tool of choice is [Nodemailer](https://github.com/andris9/Nodemailer). SMTP server settings we provide via `env.json` configration.

Currently emails are sent only in change password functionality, but in near future we will work on configuration of all notifications for both users and official workers.

#### Internationalization

We're after gettext solution:
* http://www.gnu.org/savannah-checkouts/gnu/gettext/manual/html_node/gettext.html
* https://developer.mozilla.org/en-US/docs/gettext

There's already designed and created placeholder project for that: `i18n2` (in _node\_modules_ folder).
You can also find that it's required and _used_ in many template modules (all `_` function calls), However for a timebeing it does nothing, real i18n2 handling has not yet been configured (it's on a priority list).

#### Unit tests

All generic low-level and core modules are backed with large number of unit tests. They're collected in `test` folder of each project, and you can run them at each repository with `npm test` command. Most of tests are written for and handled by [TAD suite](https://github.com/medikoo/tad).

There's no configured unit tests for top application logic, and currently there's no plan to provide such.

#### Glue (Mano)

We explained all core modules and low-level utilities of the application, but we still know nothing about initialization, setup steps and the glue that binds the modules together.

Mano package is responsible for all of that.

##### Definition of applications

HTTP server of the project is initialized by Mano. One server can serve many applications. By application in that case we understand website with predefined url's and views. We show different website (application) to anonymous user and different to authenticated user. Additionally authenticated users can be of many roles, we may show different website to regular user, and different to official role that is responsible e.g. for revision.

On initialization Mano scans project directory tree for all configured applications. Each folder that has `mano.js` configuration file is considered as root for application.

`mano.js` is basic configuration of application. It usually provides 3 settings:
* **route** - the function that takes HTTP request objects, and returns true if request should be addressed by given application
* **order** - by this value order in which application _route's_ needs to be called is decided.
* **viewPath** - Path to view folder (if outside of application folder). View folder holds both URL -> Views mappings and all website templates

Currently in typical eRegistrations project we define over 7 different applications:

* **public** - Public website for anonymous user
* **user** - Website for registered user, who hasn't sent his application
* **user-submitted** - Website for registered user, who already sent his application
* **site-admin** - Site administrator website. Site administrator is user management role, can remove registered users, change their roles, create new users
* **super-user** - Website for demo purpose super user role. User has access to all official roles screens and can demonstrate all the flow of the application process
* **schema-admin** - Website for models administrator, who is able to change configuration of defined process rules.
* **official/revision** - Website for official application revisor
* **official/...** - Other websites for official roles

##### Organization within application folder

* __client__ - Files specific for client-side, usually it consist of:
	* __controller.js__ - (optional) Controllers handling form submissions on client-side
	* __legacy.js__ - Configuration for legacy side, explained in [Legacy browsers handling](#legacy-browsers-handling) section
	* __model.js__ - (optional) Database models that needs to be provided on client-side for given application. Usually it imports common models from top _model_ folder and adds some customizations. This file is not loaded in client directly. This module is used as input for _model generator_ which creates _model.generated.js_ raw schema file, that is loaded dirctly on a client.
	* __model.generated.js__ - Automatically generated (not version controlled) schema file (as explained above)
    * __program.js__ - Main program, this is the first module to run when script is executed in browser. It usually calls `mano` framework client tools with provided configuration.
* __model__ - (optional) Database models specific to application.
    * __role.js__ - If website is main website for given role, then this file it contains _role_ definition.
One of the most important things that it defines is `access` function, through which we define which objects are send to client for user authenticated with that role.
* __public__ - (optional) Static files specific for a website. It's about assets like css and image files.
* __server__ - (optional) Server specific code
    * __controller.js__ - (optional) Server-side handling of custom form submissions.
* __utils__ - (optional) Simple generic utilities specific for given website
* __view__ - View folder holds both URL -> Views mappings and all website templates. Currently we keep it outside of application folder. There's _view_ directory in top project folder, and over there are all views for each application. It's done like that due to hacky way templates are bundled for a browser. To be able to share templates between websites, we need to have all websites's views placed in one folder.

##### Form submission controllers

Currently controllers for all form submission needs to be declared, but this is subject to change in near future.
With static website generation done, such setup will no longer be needed, and form controllers will be automatically generated by Mano out of defined forms.

For time being form controllers need to be defined in three different folders:
* _/controller_ - Common logic for client and server, usually just validation
* _/client/controller_ - Run on client-side
* _/server/controller_ - Run on server-side

Please refer to existing controllers configuration to see how it's done.

##### Server-side setup and initialization

###### Initialization

Application is run with `npm start` command, which actually runs `mano/bin/start` script.
`start` command runs whole _setup_ of application and starts the server. Initializations consist of following steps:

1. Information about all applications (websites) is collected from project folders
1. Generate model:role tags. As client-side application for each role, should be provided with different model and data, and on server side models for all applications are loaded into one process, we need some more information to know which model and data should be provided to which client. To obtain that, for each role we tag all model properties that are applicable to this role. It results in _/server/model-tags.generated.js_ files created in each application (usually dedictated to individual role)
1. Load all DBJS models (schemas) into memory
1. Load tags (generated at point 2) into memory
1. Generate client-side models. Having all models loaded and all properties tagged for each role, we generate model files for each client application. It results with _/client/model.generated.js_ files in each application folder.
1. Run eventual application specific setup scripts
1. Generate browser bundles for each application, results in _/public/name-of-application.js_ files in each application folder
1. Populate DBJS with data from persistent layer (currently served by MongoDB)
1. Start HTTP server and configure it to serve defined websites

There are other tasks which allow to run some of above steps in more controlled way:
* `npm run setup` runs points 1-7, setups application but doesn't run the server.
* `npm run quick-start` runs 1, 3, 4, 8 and 9 steps. Assumes that all scripts generated by setup are up to date and just loads data into memory and starts the server.
* `npm run webmake` runs point 7

###### Data persistent layer

As it was mentioned in [Data modelling](#data-modeling) section, currently we use MongoDB, which listens for all the changes on DBJS and saves them to database. You can see how it's achieved by looking at _/lib/server/mongodb-driver.js_ and _/lib/server/mongodb-dbjs.js_ modules of Mano package.

###### HTTP Server

HTTP Server is configured with [Connect middleware framework](http://www.senchalabs.org/connect/).
Middleware step by step configuration, can be quite clearly read and understood from a _/lib/server/app-server.js_ Mano module. Note that we hack Connect's `use` method, to allow custom order of middlewares

`AppServer` constructor configures all middlewares, then extra configuration for each application is loaded via `AppServer.prototype.add(application)` method.

##### Client-side program

When application is loaded on client-side, first module that is loaded is _/client/program.js_ (from application folder). It invokes initial Mano setup that is dedicated for client-side. Setup steps are well documented and can be clearly read in its module _mano/lib/client/index.js_.

#### Alphabetical list of all core packages

##### bcrypt - https://github.com/ncb000gt/node.bcrypt.js
Bcrypt password hashing. See [authentication](#authentication) section.

##### bindings - https://github.com/TooTallNate/node-bindings
Used by modules that needs compilation step (e.g. [bcrypt](#bcrypt))

##### cli-color - https://github.com/medikoo/cli-color
Colors and the formatting for the console. Used by console scripts in [XLint](#xlint), [TAD](#tad) and some others

##### clock - https://github.com/medikoo/clock
Time related functions. This package is deprecated, but it's still used internally by [TAD](#tad)

##### commander - https://github.com/visionmedia/commander.js
Used in few packages as shell arguments handler.

##### connect - https://github.com/senchalabs/connect
HTTP server framework, our HTTP server configuration is build on this module. See [HTTP Server](#http-server) section.

##### cookies - https://github.com/jed/cookies
Server side HTTP cookies handler, configured as middleware for [connect](#connect)

##### crypto-js
Provides sha256 JavaScript implementation. See [authentication](#authentication) section.

##### dbjs - https://github.com/medikoo/dbjs
In-memory Database Engine, used on both server and client side. See [data modeling](#data-modeling) section.

##### dbjs-dom - https://github.com/medikoo/dbjs-dom
DOM bindings for [DBJS](#dbjs) database engine.

##### dbjs-dom-bootstrap
Extension to [DBJS-DOM](#dbjs-dom) bindings that handles custom [Bootstrap](http://twitter.github.io/bootstrap/) controls.

##### dbjs-ext - https://github.com/medikoo/dbjs-ext
Extension types for [DBJS](#dbjs) database engine

##### debug - https://github.com/visionmedia/debug
Debugging utility used by [Connect](#connect) and [Send](#send)

##### debug-utils
Debugging utilities used only for custom debugging (not referenced in other code).

##### deferred - https://github.com/medikoo/deferred
Promises implementation. See dedicated [deferred](#deferred---modular-and-fast-promises-implementation) section.

##### dom-ext - https://github.com/medikoo/dom-ext
DOM extensions that help to deal with DOM API. See dedicated [dom-ext](#dom-ext---dom-utilities-extensions) section

##### dom-shim
Browser shims, for standard functions that are not supported by some browsers. Currently it provides just `classList` shim that helps addressing DOM elements classes

##### domjs - https://github.com/medikoo/domjs
DOM template engine for client and server. See [Views & templates](#views--templates) section.

##### domjs-ext
Extensions for [domjs](#domjs---httpsgithubcommedikoodomjs)

##### duration - https://github.com/medikoo/duration
Time duration utility. Used internally by [TAD](#tad)

##### ent - https://github.com/substack/node-ent
Encode and decode HTML entities. Used internally by [Mano](#mano).

##### es5-ext - https://github.com/medikoo/es5-ext
ECMAScript5 extensions, low-level language utilities, used by many other modules. See [dedicated section](#es5-ext---ecmascript-5-extensions).

##### es5-fix
Some native methods are broken in some engines, this modules fix that. Run by [Mano](#mano) on program initialization in a browser

##### es5-shim
Some native methods are not implemented in some engines, this modules shim missing functionalities. Run by [Mano](#mano) on program initialization in a browser

##### es6-map
Implementation of Map collection (according to ECMAScript 6 proposal). Used internally in [DBJS](#dbjs)

##### esprima - https://github.com/ariya/esprima
ECMAScript AST tree parser. Used internally by [find-requires](#find-requires---httpsgithubcommedikoofind-requires)

##### event-emitter - https://github.com/medikoo/event-emitter
Cross-environment event emitter. Used by many modules. See [dedicated](#event-emitter---event-emitter) section.

##### find-requires - https://github.com/medikoo/find-requires
Find all require() calls. Used internally by [Webmake](#webmake).

##### formidable - https://github.com/felixge/node-formidable
Handles asynchronous file uploads on server-side. Handled by middleware configured on [Connect](#connect---httpsgithubcomsenchalabsconnect)

##### fresh - https://github.com/visionmedia/node-fresh
HTTP response freshness testing. Used by [Connect](#connect---httpsgithubcomsenchalabsconnect) and [Send](#send---httpsgithubcomvisionmediasend)

##### fs2 - https://github.com/medikoo/fs2
Functions that extend and complement Node.js fs package. Used internally by many server-side packages.

##### gm - http://aheckmann.github.com/gm/
Image processing package. It generates for us image and pdf thumbnails. Used in form submission controllers that handle file uploads.

##### i18n2
Gettext, translation module. Currently just placeholder. See [dedicated](#internationalization) section.

##### jshint - https://github.com/jshint/jshint
Modified version of static code analysis tool. Used for code linting by [XLint](#xlint---httpsgithubcommedikooxlint)

##### jslint-mod - https://github.com/douglascrockford/JSLint
Modified version of static code analysis tool. Used for code linting by [XLint](#xlint---httpsgithubcommedikooxlint)

##### location-emitter
URL location handler for client-side. Used for URL routing.

##### mano
Application framework. Setups http server and configures client-side application. See [dedicated](#glue--mano) section.

##### mano-auth
Authentication logic for [Mano](#mano) framework. See [dedicated](#authentication) section.

##### mano-legacy
Generic modules for legacy browsers. See [Legacy browsers handling](#legacy-browsers-handling) section.

##### memoizee - https://github.com/medikoo/memoize
Memoize/cache solution used by various modules. See [dedicated](#memoizee---memoizecache-solution) section.

##### microtime-x - https://github.com/medikoo/microtime-x
Cross-environment microseconds solution. Used by [time-uuid](#time-uuid---httpsgithubcommedikootime-uuid) package

##### microtime - https://github.com/wadey/node-microtime
Get current time in microseconds in Node.js. Used by [microtime-x](#microtime-x---httpsgithubcommedikoomicrotime-x) package

##### minimatch - https://github.com/isaacs/minimatch
Matching utility. Helps in translating .gitignore rules for modules in [fs2](#fs2---httpsgithubcommedikoofs2) package.

##### mongodb - https://github.com/mongodb/node-mongodb-native
MongoDB native driver. Used by [Mano](#mano)

##### mutable - https://github.com/medikoo/mutable
Mutable value interface. See [dedicated](#mutable---mutable-interface) section.

##### next-tick - https://github.com/medikoo/next-tick
Cross environment nextTick polyfill. See [dedicated](#next-tick---next-tick-for-any-environment)

##### next - https://github.com/medikoo/node-ext
Node.js extensions, used mainly for custom modules handling. This package is deprecated but used by [Webmake](#webmake---httpsgithubcommedikoomodules-webmake) and [TAD](#tad---httpsgithubcommedikootad) packages

##### nodemailer - https://github.com/andris9/Nodemailer
Sends emails. see [dedicated](#email-messaging) section.

##### optimist - https://github.com/substack/node-optimist
Input arguments parser. Used only by [TAD](#tad---httpsgithubcommedikootad) and [Webmake](#webmake---httpsgithubcommedikoomodules-webmake) if we call those modules directly from shell. Otherwise obsolete

##### overlay
Overlay popup box. Used by `modal` [DOMJS extension](#domjs-ext)

##### path-x
Cross environment version of Node.js _path_ module. Used internally by some modules.

##### punycode - https://github.com/bestiejs/punycode.js
Used internally by [url-x](#url-x) module

##### querystring-x
Cross environment version of Node.js _querystring_ module. Used internally by [url-x](#url-x) module.

##### router
Application routes handler. Used by [Mano](#mano)

##### send - https://github.com/visionmedia/send
Static files server for connect. Used by [Mano](#mano) middlewares and [Connect](#connect---httpsgithubcomsenchalabsconnect).

##### set-collection - https://github.com/medikoo/set-collection
Set collection type. See [dedicated](#set-collection-set-collection-with-extensions) section.

##### tad - https://github.com/medikoo/tad
Tests suite. Many of dependencies have test written with tad. Tests can be run via `npm test` invoked in main application folder. See [Unit tests](#unit-tests) section.

##### test - https://github.com/Gozala/test-commonjs
Used internally by [TAD](#tad---httpsgithubcommedikootad).

##### time-uuid - https://github.com/medikoo/time-uuid
Unique ID generator. User internally by [DBJS](#dbjs---httpsgithubcommedikoodbjs).

##### tree
Basic DOM-like tree implementation. Used internally by [view](#view)

##### url-x
Cross environment version of Node.js _url_ module. Used internally by some modules.

##### view
Views handler/router. See [Views & templates](#views--templates) section.

##### webmake - https://github.com/medikoo/modules-webmake
Modules bundler for client-side. See [Modules system](#modules-system) section.

##### xlint - https://github.com/medikoo/xlint
Xlint CLI for JSLint and JSHint. See [Quality maintenance](#quality-maintenance) section.

## Organization of eRegistrations logic

eRegistrations system consist of public website, and websites dedicated for other specific roles. Each website is configured in distinct folder. See [Definition of applications](#definition-of-applications) for more details.

eRegistrations model is centric to application of user who wants to become a merchant and requests specific documents (which we call also _inscriptions_).

Definitions of inscriptions (result documents) and required documents are kept in `/user/model/documents/` folder.

All user file properties (fields used in Guia, data and other forms) are defined in `/user/model/user/` folder.

Views (screens) for each system role are defined _view_ folders dedicated for each role. See [Organization within application folder](#organization-within-application-folder) section.

User application statuses (e.g. _application submitted_, _at revision_ etc.) are configured with dynamic properties in two files:
* For part A (Guia -> Application submission) in `/user/model/user/process.js`.
* For part B (Application submission -> Release of requested documents) in `/user-submitted/model/user/user.js

## Development (work) organization

We follow generally agreed good practices that are followed by developers of popular open source projects today.

Each programmer should work on his fork, and submit the work as pull request, which then is revised and accepted for master. Revision and acceptance of work should be done by other developer who is already experienced with application architecture.

Whenever you submit pull request, please mention the person that should revise it in pull request body (e.g. `/cc @medikoo`). It's important as in case of specific notifications configuration, maintainer of repository may not be notified automatically. Mentioning revisor assures that email with Pull Request notification lands in his mailbox.

It's important that development is not made on _master_ branch of a fork. Ideally each feature should be implemented in own dedicated branch, which can be deleted after finished feature is merged into master repository.

To avoid conflicts, programmer's fork should be updated with origin on regular basis, good practice is to update it each morning on a day of work on application.

#### How to update your fork so it's up to date with origin repository

If you're not that familiar with git, following step by step instruction should be helpful

Open github shell in a path of your repository. You can do it from Github desktop app: _eregistrations-* -> tools -> open a shell here_.

Firstly you need to make that you have already added _main_ repository to your git configuration. It's the thing that you do only once, with following command we name _main_ repository as `main`:

```
git remote add main git@github.com:egovernment/eregistrations-*.git
```

Be sure to replace `eregistrations-*` with exact name of eregistrations project you're going to work on.

After _main_ repository is configured, you can update your fork by executing following commands.

* `git checkout master` (switch to master branch of your fork)
* `git pull main master` (pull and merge changes from origin repository)
* `git push` (push merged changes to github)
* `git checkout name-of-your-working-branch` (switch to your working branch)
* `git merge master` (merge your branch with master)
* `git push` (push merged changes to github)

After executing above, when you start/restart app, you'll see the most recent version of application.
