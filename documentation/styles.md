# Documentation of styles created in eRegistration prototype

---

## Table of content

### Overview

1. Base styles
 1. File organization
 2. Conventions
 3. Application specific CSS bundle configuration
2. Vertical rhythm and layout
3. Responsiveness
4. Cross browser and legacy browsers
5. Print
6. Font icons
7. Error page

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

### Base styles
#### File organization

All cross eRegistrations, styles are placed in eRegistrations project in css folders:

1. **Basic** - directly in *eregistrations/css* folder, contains all defauld, basic style files, such as *base*, *forms*, *table*. 
2. **Components** - *eregistrations/css/components* folder, contains all, reusable and non-reusable components files, such as *section-priamary* or *container-with-nav*.
3. **Legacy** - *eregistrations/css/legacy* folder, contains all css components files that need overriding for legacy browsers *(IE8-IE11)*.

#### Conventions

1. **No element id's** in css rules (in our application id's are set strictly for JS related functionalituies).
2. **Classnames in lower case dash convention** e.g. foo-bar *(not fooBar)*.
3. **Functional Class Names** - specifiy element class names (of components and its items) based on their function.
4. **All prefixed properties are resolved** automatically (no need to add manualy) with help of [this utiltiy](https://github.com/medikoo/css-aid#css-aid) (there's a change we're move to more powerful autoprefixer at some point).
5. **Use variables** - for colors and sizes, variables defined at beginning of *base.css* file should be used. [This utiltiy](https://github.com/medikoo/css-aid#variables) is used for variables.
6. **Vertical rhythm in layout (VR)** - whole layout needs to comply to this rule, see [article](http://24ways.org/2006/compose-to-a-vertical-rhythm/) (We confirm it with browser extensions, e.g. GridFox on Firefox or PixelPerfect for Chrome (for this use *grid-22.png* file, placed in *eregistrations/css folder*).
7. **Css lint rules** - we use [this lint tool](https://github.com/medikoo/csslint-next)  it is based on [this tool](https://github.com/CSSLint/csslint). There's already a css lint scripts configured within eRegistrations project.

####Application specific CSS bundle configuration

- **Link application css file**, within *view/{applicationName}/index.html* (name should reflect application name) as [here](https://github.com/egovernment/eregistrations-salvador/blob/master/view/public/index.html#L27).
- **Configure** *{applicationName}/client/index.css* file, it should list all css files in given order that should be included in a bundle, as e.g. [here](https://github.com/egovernment/eregistrations-salvador/blob/master/public/client/css.index)

