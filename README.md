# eRegistrations
## Base framework for eRegistrations applications

Table of contents:

1. [Introduction](#introduction)
    1. [Language](#language)
    1. [Modules system](#modules-system)
    1. [Quality maintenance](#quality-maintenance)
1. [Architecture](#architecture)
    1. [Low-level utilities](#low-level utilities)
    1. [Data modeling](#data-modeling)
    1. [Views & templates](#views-and-templates)
    1. [Legacy browsers handling](#legacy browsers handling)
    1. [Authentication](#authentication)
    1. [Email messaging](#email-messaging)
    1. [Internationalization](#internationalization)
    1. [Unit tests](#unit-tests)
    1. [Glue (Mano)](#glue-mano)
        1. [Applications & files organization](#applications-and-files-organization)
        1. [Form submission Controllers](#form-submission-controllers)
        1. [Server-side program](#server-program)
            1. [Initialization](#initialization)
            1. [Data persistent layer](#data-persistent-layer)
            1. [HTTP Server](#http-server)
            1. [Client-side program](#client-side program)
    1. [List of all packages (alphabetical))](#list-of-all-packages-alphabetical)
1. [Organization of eRegistrations logic](#organization-of-eregistrations-logic)
1. [Development (work) organization](#developement-work-organization)

## Introduction

This documentation is about all technical aspects of the framework, which understanding is important to develop eRegistrations systems. It does not focus on end user perspective of application.

### Language

eRegistrations is full-stack JavaScript project, that means both client and server side logic is programmed in JavaScript.

Base for our code is ECMAScript 5 edition. It's very important distinction from popular tools of web today, which (in due to provide support for IE6-8 browsers) are based on ECMAScript 3.

We provide [Single-page application](http://en.wikipedia.org/wiki/Single-page_application) for modern browsers, and having Node.js we generate static pages on server-side _(currently WIP)_ for browsers of old web (or spiders).

Ideally our full stack JavaScript application can be fully functional in a browser with JavaScript support turned off.

If you're not familiar with ES5, it's very important that you know all the differences. In eRegistrations, we use ES5 at it's best. We use all Array iterator methods (`forEach`, `some` etc.), we don't use  `for` or `for in` construct, as they're not that convenient. We use _getters_, _setters_ and _descriptors_ for object modeling. We also write all of our code in _strict_ mode.

See following:
* http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
* http://www.slideshare.net/kangax/say-hello-to-ecmascript-5

It's important to add that idea is to write JavaScript in most _natural_ for JavaScript way. JavaScript is neither strictly OOP or strictly functional language, it's somewhere between. It's best to take all that's suitable from both worlds, but without getting too far. We don't struggle to write JavaScript as it's Java, and we don't struggle to write it as it's Haskell.

_"Choose native"_ approach applies also to all other API's. We use native HTML5 for things that we used to program with JavaScript in old days. We configure animations with CSS3 transitions (not with JavaScript). Old browsers won't get that, but as far as it's just enriching sugar, it's not important. There's no need to provide fireworks to e.g. IE7 or IE8. Instead [we care about progressive enhancement](http://jakearchibald.com/2013/progressive-enhancement-still-important/), we assure that application is accessible and fully functional in old browsers.

### Modules system

We use Node.js style modules system. It is best modules system that JS (and probably whole programming world) currently has. With [npm](https://npmjs.org/) and [semantic versioning](http://semver.org/) on board we're free of dependency resolution problems that are eminent to corresponding (and already powerful) systems in other popular languages.

_If you're more familiar with AMD/Require.js, you need to be aware that Require.js is very different and has not much to do with `require` as introduced earlier with CommonJS (then Node.js). In comparison with Node.js, AMD cross-modules dependency resolution style is quite limited and unnecessary complex. Same when speaking of lazy loading, which should not be done as low level as per Node.js module._

Node.js modules style is also closest to native JavaScript modules that will be brought with ES6 by end of 2013. It's likely, that when standard will be coined sometime next year we will switch from Node.js modules to native ES6 modules.

We use [Webmake](https://github.com/medikoo/modules-webmake#modules-webmake) to bundle Node.js modules for browser.

Modularization of eRegistrations application is very fine-grain, e.g. Lomas user application is bundled out of over 400 individual JavaScript files (modules). When designing modules we try to follow [Unix philosophy rules](http://en.wikipedia.org/wiki/Unix_philosophy). Currently most popular web tools, are not exactly there. Usually they're big or medium libraries, kept in one big file.

All modules/packages we use are explained in recommended reading order in [Architecture](#architecture) section. Later when you are more familiar with how things works, you can refer to [list of all modules in alphabetical order](#list-of-all-packages-alphabetical).

### Quality maintenance

We guard code quality with [XLint](https://github.com/medikoo/xlint) it's actually just CLI for linter of choice that allows us to keep all settings in external and single configuration file (_.lint_). Additionally it understands _.gitignore_ rules and has other nice goodies like live console.

Our XLint setup is configured to lint code with modified versions of both [JSLint](http://www.jslint.com/) and [JSHint](http://www.jshint.com/). Why both? Thing is that JSLint does nice white-space check, and that is broken in JSHint, and JSHint informs about any unused variables and such option is not present in	JSLint. Ideal solution would be to use one well configurable and powerful tool, but there's none such on horizon yet.

One limitation for timebeing is that we need to fire JSHint and JSlint validation with separate runs (reports are not cumulated into one). So, to see JSLint report do:

	$ npm run jslint
	
Same for JSHint:

	$ npm run jshint
	
Be sure to run validation once you checkout the project. Normally you should be presented with `100.00% OK` message. If you're on Windows and instead see a lot of whitespace errors, it means you need to make sure your editor or [git itself](https://help.github.com/articles/dealing-with-line-endings#platform-windows) doesn't update line endings for you. We strictly use unix style line endings in our code, and all your tools must play nice with that.

If you want to access live console that observes current state of files (shows and clears errors as they're introduced) run:

	$ npm run jslint-console

and for JSHint:

	$ npm run jshint-console

Best way to work with XLint, is to integrate editor of your choice with it. There's a `terse` option that gives machine readable output for given file (and in that case reports of JSLint and JSHint can be accumulated). We have already working solution for Emacs editor, and I believe we can come up with one for SublimeText, with others we should check what's possible.

Additionally each eRegistrations project should be accompanied with [Travis CI](https://travis-ci.org) configuration that validates each pull request with XLint


## Architecture

Before we dive into most important modules that deal with models, views, server and other core of application, let's look at low-level utilities/helpers that are used across all of them.

### Low-level utilities

#### [es5-ext](https://github.com/medikoo/es5-ext) - ECMAScript 5 extensions

It's _lang_ package, serves similar role as very popular [underscore](http://underscorejs.org/) project in ES3 world.
Difference is that es5-ext stands on ES5, much closer follows language conventions and each utility function is served as individual module . All modules are documented in [es5-ext documentation](https://github.com/medikoo/es5-ext), please get accustomed with what it offers. If it misses something valuable, we accept pull requests (but to save your time, it's wise to discuss such addition first).

#### [event-emitter](https://github.com/medikoo/event-emitter) - Event emitter

Cross-enviroment event-emitter solution. It backs many API's that have more custom role, all DBJS objects, promises, mutables, sets and hell of others. It's basic, fast and extremely useful, refer to [documentation](https://github.com/medikoo/event-emitter) for details.

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

Aid for asynchronous programming, it's used heavily with scripts written for _node_ and to less extent in browser scripts.

Promise concept got attention in last months. If you haven't read about please refer to [deferred documentation](https://github.com/medikoo/deferred), and be sure to check various articles that popped out recently.

I also tried to coin the point in [presentation some while ago](http://www.medikoo.com/asynchronous-javascript/)

#### [set-collection](https://github.com/medikoo/set-collection) Set collection with extensions

If you're not familiar with `set`, Set is unordered collection of unique values, where value is any JavaScript value. We use `sets` heavily in [DBJS](#DBJS) they serve for multiple values and various object collections.

This project should be (and will be) split into two, implementation of `set` up to ECMASCript 6 proposal, and `set-ext` (extensions for `set`). Currently as [mutable](#mutable) it's in immature state, and is subject to many changes.

#### [dom-ext](https://github.com/medikoo/dom-ext) - DOM Utilities (extensions)

Equivalent for DOM API. List of all functions is currently missing in main doc, but they can be read from list of files in corresponding folders.

### Data modeling

Here we're entering most powerful and most sophisticated part of the system. We use [DBJS](https://github.com/medikoo/dbjs) to handle all our data modeling needs.  
__It's very important that you read [DBJS documentation](https://github.com/medikoo/dbjs)__ to see how engine is organized, how to define data models and how to work with data instances.

Currently we just put all data into MongoDB, and retrieve that on initialization, it is not effective and scalable approach when dealing with large amounts of data, but that's temporary solution. Plan for next months is to upgrade DBJS so it works with [LevelDB](http://dailyjs.com/2013/04/19/leveldb-and-node-1/) and is accompanied by both lazy loading and good scalability.

### Views & templates

#### Template language

The common way across frameworks is to write HTML strings, concat them and inject via innerHTML. This is because it is what we were accustomed to, by serving static pages from a server to browsers in old days. Other reason is that HTML feels as most convenient way to many (especially designers, or front-end developers which don't want to mess with "server-side" language).

The problem is that for SPA apps, HTML is limited approach, technically we write HTML, concat it, inject into DOM, and then get elements from DOM to do further processing.
It can be simpler and we can be more effective if from a start we would work with a DOM. This problem was well described by Jed Smith, who is the author of DOMO (simple lib that stands on same principle as DOMJS we use). See: http://www.youtube.com/watch?feature=player_detailpage&v=_EsgFWU-xwU#t=573s

So in eRegistrations we define templates with DOM, through [DOMJS](https://github.com/medikoo/domjs). It's actually plain JavaScript, see it's documentation for good introduction.

What we're left with, is the problem of maintainability by designers or front-end developers.  
First question, is, is it really a problem (?) Front-end developers are already familiar with JavaScript and it is not that they should work with unfamiliar language, in our case I already got two front-end developers from our team (Florent and Celia) working with that and they seem to do well by introducing and editing html on existing pages.

Still, if there would be a need, we may also provide a HTML -> DOMJS converter, which [is provided in Facebook React](http://facebook.github.io/react/docs/syntax.html) which shares very same concept. It won't be difficult to configure such proxy, and we already have working _plain HTML to DOMJS_ converter.

#### View files organization and URL routing

All view files are grouped in _view_ folder (refer to [organization](#applications-and-files-organization) section).

Each application has individual view folder, and has individual URL routing.

Both URL's and Views are represented via individual trees, which are mapped together.

Example of URL tree in Lomas user application:
<img src="http://medyk.org/ereg-url-tree.png" />

Example of View tree:
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

We can also define new values for element attributes, and there's special handling for classes, e.g. in following we make sure that for #nextStepLi element class `active` was added
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

As it was already mentioned URL tree is mapped to View tree, it is currently done in __routes.js_ file, but in future such mapping will be read from organization of file tree. In above (Lomas) example following mapping was made:

* index.js -> /
* otras-caracteristicas.js -> /otras-caracteristicas/
* ingrese-sus-datos.js -> /ingrese-sus-datos/
* representante/index.js -> /representante/:id/
* documentos.js -> /documentos/
* envie.js -> /envie/
* perfil.js -> /perfil/

