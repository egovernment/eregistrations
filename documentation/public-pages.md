# eRegistrations Public Pages

This document provides guidelines on how to configure and change content of a public pages in eRegistrations systems.

Configuration of public pages is kept in [/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public) folder, where:
- [/public/view](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/view) contains HTML files and configuration of relations between them
- [/public/css](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/css) contains CSS files (which are joined and server as one CSS file)
- [/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) contains static files (images, external JS libaries, pdf documents etc.)
- [/public/routes.js](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/routes.js) defines URL routes (which view should be visible at which route)

Follow below explanations for full picture

## General guideliness

Below points should be respected to assure trouble-less maintenance among different environments

- All filenames added to the repository should be lowercase.  
_Reasoning: We usually develop using case-insensitive filesystems, however our application is served on production from a filesystem which is case-sensitive.
So while in development linking `Foo.jpg` in html with `foo.jpg` url, will not indicate anything wrong, on production it will produce 404 error. Sticking strictly to lower-case assures that such problems do not occur._
- Use only unix style line endings `\n`. If you're on Windows please assure that you're editor is configured for those.  
_Reasoning: Our developers work on many different systems (OSX, Linux, Windows), so using one agreed style is important to assure that files are visible properly for every developer that opens the file. Unix style line endings while being most appropriate from semantic point are also agreed as common convention among web developers_

## Static files

Images, PDF documents, external JS libraries (which are loaded via `<script>` tag), and other files to download should be put in [/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) folder.

[/public/public](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/public) is also understood as root folder for all static content. So if you put `foo.jpg` into `/public/public/img/foo.jpg`, then you can link it in HTML via `<img src="/img/foo.jpg" />` (still you should use `${ stRoot }` so `<img src="${ stRoot }img/foo.jpg />` See [html](#html) section for more information).

Do not place HTML and CSS file in that folder. Following sections will explain on how to deal with them

## CSS Stylesheets

CSS files should be placed in [/public/css](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/css) folder, and then listed in [/public/client/css.index](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/client/css.index) file.
On basis of that one CSS file which can be accessed at `/public.css` url is created.

All listed CSS files are run through [Autoprefixer](https://github.com/postcss/autoprefixer#autoprefixer-) utility which allows you to write plain CSS, with no need to worry of vendor prefixes.

Additionally you're allowed to use [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) as described in [css-aid](https://github.com/medikoo/css-aid#variables) module. They will be recompiled so result is visible in all browsers as expected

## HTML pages markup

HTML files are placed in [/public/view/html](https://github.com/egovernment/eregistrations-lomas/tree/new-public-pages/public/view/html).

### Files organization

Each HTML file constitutes the view, which can be extended with other view (HTML view). This allows to not repeat markup e.g. header and footer) that spans multiple pages. How does it work:

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

I intentionally didn't fill the content for `<main>` element, as I'd like to have it different for homepage and some other sub pages. Let's then define a homepage extension:

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

Now let's define _main_ content for _individual-trader_ and _company_ sub pages:

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

Above files neatly provide HTML we want to present, but doesn't really configure that e.g. _homepage.html_ is a content that should land in `<main>` element provided in _body.html_ view.

#### View tree configuration

This is done via simple JS configuration, made in [/public/view/index.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/view/index.js) file

Each view is configured with simple JS objects, e.g. configuration for base _body.html_ view:

```javascript
// 'base' is a unique name of that view (it can be any string, it just needs to be unique against other view names)
exports.base = {
  // name of property indicates name (or id) of element of which content we want to fill.
  // In this case it's 'body', as we want a <body> element to be filled with content of html/body.html file
  body: require('./html/body'),
};
```

Configuration for a homepage view

```javascript
// Configuration for a homepage view
exports.homepage = {
  // Extends 'base' view:
  _parent: exports.base,
  // Replace content of <main> element with:
  main: require('./html/homepage'),
  // Let's also setup some page title:
  title: "eRegistrations"
};
```

Configuration for a "Individual trader" and "Company" sub pages:

```javascript
// Configuration for a "Individual trader" view
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

Above just shows example of basic configuration. In addition to that, we may:

##### Add/remove classes on specified elements

```javascript
exports.someViewName = {
  _parent: exports.otherView
  // On element of id 'foo' that's exposed in otherView
  foo: {
    // Add class 'active' and remove class 'hidden'
    class: { active: true, hidden: false },
    // Replace content of element with:
    content: require('./html/foo')    
  }
}
```

##### Append/prepend HTML

Instead of replacing whole content for addressed element, we may configure append or prepend of content to it:

```javascript
exports.someViewName = {
  _parent: exports.otherView
  // On element of id 'foo' that's exposed in otherView
  foo: {
    // Prepend content with
    prepend: require('./html/foo-prepend')
    // Append content with
    append: require('./html/foo')    
  }
}
```

#### URL routing

View configuration defines relations between views, but doesn't decide which view is mapped to which url.
That is done in [/public/routes.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/routes.js)

e.g. for above example views, we may decide that _homepage_ should be displayed at `/`, _individual-trader_ at '/individual-trader/` and _company_ at `/company/` url:

```javascript
var viewTree = require('./view');

module.exports = {
	'/': viewTree.homepage,
	'individual-trader': viewTree.individualTrader,
	'company': viewTree.company
}
```

### Insertion of dynamic (or application model dependant) content

If we need to insert some content that comes from core application logic (e.g. table of objects coming from eRegistrations model, or some other things that require interaction with application), then first we need to configure an insert for it in: [/public/view/inserts.js](https://github.com/egovernment/eregistrations-lomas/blob/new-public-pages/public/view/inserts.js) e.g.:

```javascript
exports.generateCostsTable = function () {
  // Dynamic domjs style content:
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

#### Preconfigured dynamic properties and functions

##### Translations

If in public pages you want to rely on applications internal translations mechanism, then within HTML you should provide translatable texts in English as follows:

```html
<h1>${ _("Information on company registration") }</h1>
```

Having above, `Information on company registration` text will appear in Meta Admin translation panel for translation.

It's up to you, wether you prefer to edit original texts in public pages HTML, or keep here just straightforward messages in English, and follow with translations in Meta Admin panel.

###### Pre-generated url root for static files

Normally url root for static files would be `/`. However on production servers for better performance we prefer static files being served via close to location CDN servers, so e.g. quite often we rely on [Amazon Cloudfront](https://aws.amazon.com/cloudfront/) service.

In such cases all our statics url needs to resolve from specific Cloudfront domain as e.g. `d2ehid2vke07c7.cloudfront.net`.
For having that assured, it's important that you use, preconfigured inserts `stRoot` variable which will in all setups resolved to expected root url.

Usage of it is as simple as:

```html
<p><img src="${ stRoot }img/foo.jpg" /></p>
```

