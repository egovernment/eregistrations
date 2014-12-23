# Documentation of styles created in eRegistration prototype

## Table of content

### Overview

1. Introduction
2. Base styles
 1. File organization
 2. Conventions
 3. Application specific CSS bundle configuration
3. Vertical rhythm and layout
4. Responsiveness
5. Cross browser and legacy browsers
6. Print
7. Font icons
8. Error page

### Reusable components

1. Forms
2. Tables 
 1. Entities table
 2. Responsive table
 3. Table filter bar
 4. Submitted user history table
 5. Submitted user data table
 6. Statistics tables
3. Sections 
 1. Primary
 2. Warning
 3. Tab navigation
 4. Entity data
4. Container with navigation
5. Labels
6. Buttons
 1. Main
 2. Resource link
 3. Next step
7. Files
 1. Uploader
 2. Button
8. Hints optional
11. Freeform text
12. Disabler
13. Error main
14. Info main

### Single type components

1. User steps menu
 1. Steps menu version 1
 2. Steps menu version 2
2. Submitted menu
3. Submitted list and thumb of documents
3. User guide box components
4. Document preview
5. Dialogs
 1. Login
 2. Sign up
 3. Inventory
 4. Application navigation
6. Public
 1. Multiple entry
 2. Banner
 3. Steps
 4. Institutions
7. Prints
 1. Users list
 2. User history
 3. User data
 4. Costs list
8. Front desk
9. Footer

---

## Base styles

### Introduction

**eRegistration style documentation** describes how styles for eRegistration prototype are designed and explain ways theye should be applied to all eRegistration systems. Markup of eRegistration systems should directly follow Prototype, in order for styles to work properly.

***

### File organization

All cross eRegistrations, styles are placed in eRegistrations project in css folders:

1. **Basic** - directly in *eregistrations/css* folder, contains all defauld, basic style files, such as *base*, *forms*, *table*. 
2. **Components** - *eregistrations/css/components* folder, contains all, reusable and non-reusable components files, such as *section-priamary* or *container-with-nav*.
3. **Legacy** - *eregistrations/css/legacy* folder, contains all css components files that need overriding for legacy browsers *(IE8-IE11)*.

***

### Conventions

1. **No element id's** in css rules (in our application id's are set strictly for JS related functionalituies).
2. **Classnames in lower case dash convention** e.g. foo-bar *(not fooBar)*.
3. **Functional Class Names** - specifiy element class names (of components and its items) based on their function.
4. **Sub components classes names** should contain component class name and added after dash their own identifier e.g. .foo-bar*(component)* .foo-bar-sub*(sub-component)* (this may not be yet in all components - if found wrong sub-components names convinin, ticket should be created and fix should be applied).
4. **All prefixed properties are resolved** automatically (no need to add manualy) with help of [this utiltiy](https://github.com/medikoo/css-aid#css-aid) (there's a change we're move to more powerful autoprefixer at some point).
5. **Use variables** - for colors and sizes, variables defined at beginning of *base.css* file should be used. [This utiltiy](https://github.com/medikoo/css-aid#variables) is used for variables.
6. **Vertical rhythm in layout (VR)** - whole layout needs to comply to this rule, see [article](http://24ways.org/2006/compose-to-a-vertical-rhythm/) (We confirm it with browser extensions, e.g. GridFox on Firefox or PixelPerfect for Chrome (for this use *grid-22.png* file, placed in *eregistrations/css folder*).
7. **Css lint rules** - we use [this lint tool](https://github.com/medikoo/csslint-next)  it is based on [this tool](https://github.com/CSSLint/csslint). There's already a css lint scripts configured within eRegistrations project.

***

### Application specific CSS bundle configuration

- **Link application css file**, within *view/{applicationName}/index.html* (name should reflect application name) as [here](https://github.com/egovernment/eregistrations-salvador/blob/master/view/public/index.html#L27).
- **Configure** *{applicationName}/client/index.css* file, it should list all css files in given order that should be included in a bundle, as e.g. [here](https://github.com/egovernment/eregistrations-salvador/blob/master/public/client/css.index)

***

### Vertical rhythm and layout

#### Vertical rhythm

**Vertical rhythm** in eRegistration can be defined as *the spacing and arrangement of components as the reader descends the page*. More basic information on VR cvan be found in this [article](http://24ways.org/2006/compose-to-a-vertical-rhythm/).  

**VR applies** to all elements (block and inline) that are placed in eRegistration system.  

**Base line** of VR in eRegistration Prototype is **22px**.

**Box components** like *section-primary* or *section-primary > form* children recive ***margin-bottom: 22px***, what gives proper VR between them (thair content is height and VR is protected by proper line-height). [Example](https://github.com/egovernment/eregistrations/blob/master/css/components/section-primary.css#L7-L11).
  
**Text components** like *headings*, *spans* or *paragraphs* have ***line-height*** defined in *base.css* to ***22px***. [Example](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L46-L52).  
If height of element is larger than 22px, line-height is doubled. [Example](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L72-L75).  
This rule controls height of components that contain text, making shour that height is multiplication of 22px, and elements in side are place with corect VR.

#### Layout

**Layout** in eRegistration basic building block of layout is flexbox rule set on parents of controlled elements. For more information on how flexbox works, please refer to this [article](http://css-tricks.com/snippets/css/a-guide-to-flexbox/).  
No floats are allowed in main css components, positiong of elements can only be achieved via flexbox, inline-block, or if necessary postion relavie fixes. Floates are only allowed in legacy css override.

**Content component** - main container of all content is [***.content***](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L139-L143) container defined in *base.css*. Its width is limited to [**1070px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L6) and it is centered on page. All first chiled elements that width should be controlled and set to full-page width, should have this class defined. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/_main.js#L10).

***

### Responsivnes

**Responsivness** is achieved in eRegistration systems by [media-queries](https://github.com/egovernment/eregistrations/blob/master/css/form.css#L385), that are checking screen resolution. No user-agent detecting is applied and needed. Resposive styles can only by applied this way.

***Mobile resolution*** is turned on when screen resolution is less than [**640px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L7).  
***Minimum mobile resolution*** is set to [**320px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L8)

**Control of responsive display** is mostly done by changing *flex-wrap* property set to *wrap* in mobile view. [Example](https://github.com/egovernment/eregistrations/blob/master/css/components/container-with-nav.css#L36-L39).

****

### Cross browser and legacy browsers

**Chrome** browser is basic browser that is used for development of styles in eRegistration systems. All styles should be build directly for this browser. 

**FireFox, Safari, Opera** are secondary browsers, that in most cases, will work as well as Chrome. But if necessary, theis browser hack are allowed in main and components css files.  
***FireFox*** hack can be made with special media selector **@-moz-document url-prefix()**. For more information on this hack please refer to this [article](http://css-tricks.com/snippets/css/css-hacks-targeting-firefox/). [Exemple](https://github.com/egovernment/eregistrations/blob/f2932305330b5af839a0a7f9305171b1701a6ab3/css/components/file-uploader.css#L37).
***Safari*** hack not applied, but if needed can be added in any proper way.
***Opera*** hack not applied, but if needed can be added in any proper way.

**Legacy browsers: IE8 - IE11** are treated in special css files, that are kept in *eregistrations/css/legacy* folder. All fixes are made by simplification of existing styles, and if necessary, set fix width and height. Layout can be fixed by applieing *floats* (but only in connection with *overflow: hidden* rule. [Example](https://github.com/egovernment/eregistrations/blob/master/css/legacy/components/container-with-nav.css#L1-L7).  
Rules are added to files that correspond to already created components. e.g. if we want to introduce some changes to legacy layer, for *css/base.css* file. We should add those rules to *css/legacy/base.css* file. Similar with components legacy fixes for *css/components/foo.css* should land in *css/legacy/components/foo.css*. Those files will be automatically picked and bundled, no extra effort is needed.

***