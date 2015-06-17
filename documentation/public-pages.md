# Public Pages

_This document provides guidelines on how to configure and change content of a public pages in eRegistrations systems_

Configuration of public pages is kept in [/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public) folder, where:
- [/public/view](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/view) contains HTML files and configuration of relations between them
- [/public/css](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/css) contains CSS files (which are joined and served as one CSS file)
- [/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) contains static files (images, external JS libaries, pdf documents etc.)
- [/public/routes.js](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/routes.js) contains URL mappings (which view should be visible at which url)

Follow below documentation

## General guideliness

Below is short list of rules which should be respected to assure trouble-less maintenance among different environments.

- __All filenames added to the repository should be lowercase and use strictly a-z, 0-9, - chars__  
_Reasoning: We usually develop using case-insensitive filesystems, however our application is served on production from a filesystem which is case-sensitive.
So while in development linking `Foo.jpg` in html with `foo.jpg` fill, will not indicate anything wrong, on production it will produce 404 error. Sticking strictly to lowercase assures that such problems do not occur.  
Restriction regarding restricted charset, applies to allowed characters in url. We don't won't rely on sometimes possibly broken, or non existent escape mechanism_
- __Use only unix style line endings `\n`__  
If you're on Windows please assure that you're editor is configured for those.  
_Reasoning: Our developers work using many different systems (OSX, Linux, Windows), so using one agreed style is important to assure that files are visible properly for every developer that opens the file. Unix style line endings while being most appropriate from semantic point are also agreed as common convention among web developers_

## Static files

Images, PDF documents, external JS libraries (which are loaded via `<script>` tag), and other files (meant to be accessible for download) should be put in [/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) folder.

[/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) is also understood as a root folder for all static content.  
So if you put `foo.jpg` into `/public/public/img/foo.jpg`, then you can link it in HTML via `<img src="/img/foo.jpg" />`.
_See however [pre-generated root for static files](#pre-generated-url-root-for-static-files) section, to learn about `${ stRoot }` variable)._

Do not place HTML and CSS files in that folder, next sections will explain where they should be maintained.

## CSS Stylesheets

CSS files should be placed in [/public/css](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/css) folder, and then listed in desired order in [/public/client/css.index](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/client/css.index) file.
On basis of that index, one CSS file is generated, which is then accessed at `/public.css`.

All provided CSS files are run through [Autoprefixer](https://github.com/postcss/autoprefixer#autoprefixer-) utility which allows you to write plain CSS, without bloat of vendor prefixes.

Additionally you're allowed to use [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) as described in [css-aid](https://github.com/medikoo/css-aid#variables) module. They will be recompiled so result is visible in all browsers as expected

## HTML pages markup

HTML files are placed in [/public/view/html](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/view/html).

### Files organization

Each HTML file constitutes the view, which can be extended with other view (another HTML file). This allows to not repeat markup (e.g. header and footer) that span multiple pages. How does it work:

Let's say we have a view for a content `<body>` element

_body.html (content for `<body>` element)_:
```html
<header>
  <nav>
    <ul>
      <li><a href="/">Main page</a></li>
    </ul>
  </nav>
</header>
<main>
  <!-- To be filled by extension views -->
</main>
<footer><p>© 2015 eRegistrations Team</p></footer>
```

Then let's then define a homepage extension, which will define a content for `<main>` element

_homepage.html (content for `<main>` element)_
```html
<h1>Homepage of eRegistrations system</h1>
<p>Here you can register your Company</p>
<p>Click below links for more information</p>
<ul>
  <li><a href="/individual-trader/">Individual trader</a></li>
  <li><a href="/company/">Company registration</a></li>
</ul>
```

Now let's define _main_ content for few other sub pages: _individual-trader_ and _company_ :

_individual-trader.html (content for `<main>` element)_
```html
<h1>Information on Individual Trader registration</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
```

_company.html (content for `<main>` element)_
```html
<h1>Information on Company registration</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
```

#### Views tree configuration

Plain HTML files, do not say a word about relations between them. This is in [/public/view/index.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/view/index.js) file, with help of simple JS configuration

e.g. configuration for base _body.html_ view:

```javascript
// 'base' is a unique name of that view
// (it can be any string, it just needs to be unique against other view names)
exports.base = {
  // name of property indicates name (or id) of an element of which content we want to replace.
  // In this case it's a 'body', as we want a <body> element to be filled with content of html/body.html file
  body: require('./html/body'),
};
```

Configuration for a homepage view

```javascript
exports.homepage = {
  // Extends 'base' view:
  _parent: exports.base,
  // Replace content of <main> element with:
  main: require('./html/homepage'),
  // Let's also setup some title for a page
  title: "eRegistrations"
};
```

Configuration for an "Individual trader" and "Company" sub pages:

```javascript
// Configuration for an "Individual trader" view
exports.individualTrader = {
  // Extend 'base' view:
  _parent: exports.base,
  // Replace content of <main> element with:
  main: require('./html/individual-trader'),
  // Page title:
  title: "eRegistrations: Individual Trader"
};

// Configuration for a "Company" view
exports.company = {
  // Extend 'base' view:
  _parent: exports.base,
  // Replace content of <main> element with:
  main: require('./html/company'),
  // Let's also setup some page title:
  title: "eRegistrations: Company"
};
```

Above is example of very basic configuration. In addition to that, we may:

##### Add/remove classes on specified elements

```javascript
exports.someViewName = {
  _parent: exports.otherView
  // On element of id 'foo'...
  foo: {
    // Add class 'active' and remove class 'hidden'
    class: { active: true, hidden: false },
    // Replace content of element with:
    content: require('./html/foo')    
  }
}
```

##### Add/remove custom attributes on specified elements

```javascript
exports.someViewName = {
  _parent: exports.otherView
  // On element of id 'foo'...
  foo: {
    // Set attribute 'data-foo' to value 'elo'
    attributes: { 'data-foo': 'elo' },
    // Replace content of element with:
    content: require('./html/foo')    
  }
}
```

##### Append/prepend HTML

Instead of replacing whole content for specified element, we may configure append or prepend of content to it:

```javascript
exports.someViewName = {
  _parent: exports.otherView
  // On element of id 'foo'...
  foo: {
    // Prepend existing content with
    prepend: require('./html/foo-prepend')
    // Append to existing content
    append: require('./html/foo')    
  }
}
```

#### URL routing

View configuration defines relations between views, but doesn't decide which view is mapped to which url.  
That is done in [/public/routes.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/routes.js)

e.g. for above example views, we may decide that _homepage_ should be displayed at `/`, _individualTrader_ at `/individual-trader/` and _company_ at `/company/` urls:

```javascript
var viewTree = require('./view');

module.exports = {
  // On left side it's url, and on right side related view
  '/':                 viewTree.homepage,
  'individual-trader': viewTree.individualTrader,
  'company':           viewTree.company
}
```

### Insertion of dynamic (or application model dependent) content

If we need to insert some content that comes from core application logic (e.g. table of objects coming from eRegistrations model, or some other things that require interaction with application), then we can achieve it via configuration of inserts.

First we need to add an insert in: [/public/view/inserts.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/view/inserts.js) e.g.:

```javascript
exports.generateCostsTable = function () {
  // Dynamic domjs style content, that lists all costs as defined in model
  return ul(db.Costs, function (cost) {
    return li(cost.name, " ", cost.amount);
  });
};
```

And then we can use it anyhwere in HTML as e.g.:

```html
<section>
  <h3>Costs table</h3>
  ${ generateCostsTable() }
</section>
```

#### Already preconfigured dynamic properties and functions

##### Translations

If in public pages you want to rely on application provided translations mechanism, then within HTML you should provide translatable texts in English as follows:

```html
<h1>${ _("Information on company registration") }</h1>
```

Having above, _"Information on company registration"_ text will appear in Meta Admin translation panel for translation.

It's up to you, whether you prefer to edit original texts directly in HTML of public pages, or keep here just straightforward messages in English, and follow with translations in Meta Admin panel.
Do what you feel is more convinient.

##### Pre-generated url root for static files

Normally url root for static files would be `/`. However on production servers for better performance we prefer static files being served via close to location CDN servers (e.g. quite often we rely on [Amazon Cloudfront](https://aws.amazon.com/cloudfront/) service).

In such cases all our statics url need to resolve from specific Cloudfront domain as e.g. `d2ehid2vke07c7.cloudfront.net`.
For having that assured, it's important that you use, preconfigured `stRoot` insert variable, which in all cases will resolved to expected root url.

Usage of it is as simple as:

```html
<p><img src="${ stRoot }img/foo.jpg" /></p>
```

Remember to use it only for __static files__ that are meant to be served from [/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public). Do not use it for application pages urls e.g. `<a href="/company">..`.

