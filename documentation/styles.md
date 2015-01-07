# Documentation of styles created in eRegistration prototype

## Table of content

### Overview

1. Introduction
2. Base styles
 1. Common eRegistration styles (Prototype) files organization
 2. Conventions
 3. System specific styles files organization
 4. Application specific CSS bundle configuration
3. Vertical rhythm and layout
 1. Vertical rhythm
 2. Layout
4. Responsiveness
5. Cross browser and legacy browsers
6. Font icons

### Reusable components

1. Forms
2. Tables 
 1. Default table
 2. Submitted user data table
 3. Responsive table
 4. Statistics tables
3. Sections 
 1. Primary
 2. Warning
 3. Tab navigation
4. Container with navigation
5. Labels
6. Buttons
 1. Main
 2. Post button
 3. Resource link
 4. Next step
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

# Overview

***

## Introduction

**eRegistration style documentation** describes how eRegistration prototype is designed and explain ways it should be used in all eRegistration systems.  
Prototype contains all requierd for any eRegistration system markup and base styles. Markup of eRegistration systems should directly follow Prototype makup, in order for styles to work properly. Basic styles contain all visual and layout  elements.  
eRegistraiton systems need to specify their theme styles, to differentiate from Prototype. 

***

## Base styles

### Common eRegistration styles (Prototype) file organization

All cross eRegistrations, styles are divided into main sections:

1. **Basic** - directly in *eregistrations/css* folder, contains all defauld, basic style files, such as *base*, *forms*, *table*. 
2. **Components** - *eregistrations/css/components* folder, contains all, reusable and non-reusable components files, such as *section-priamary* or *container-with-nav*.
3. **Legacy browser styles** - *eregistrations/css/legacy* folder, contains all css components files that need overriding for legacy browsers *(IE8-IE11)*.
4. **Print** - base print css are directly in *eregistrations/css* (as basic files), and special print components are kept in *eregistrations/css/components* (just like other reusable and non-reusable components)

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

### System specific styles

Any specific system builded on top of eRegistration, in order to differentiate from Prototype, require theme specific styles. **Theme** css files are placed directly in *system-name/css* folder. Theme contains upcommint components: 

1. **theme.css** file, where all basic styles from prototype are overiten. At the beginning of file, [used in theme fonts](https://github.com/egovernment/eregistrations-salvador/blob/master/css/theme.css#L1-L28) need to be defined, as well as [variables overide](https://github.com/egovernment/eregistrations-salvador/blob/master/css/theme.css#L30-L47).
2.  **theme-public.css** file, where all components used on public pages (like modals, [example here](https://github.com/egovernment/eregistrations-salvador/blob/master/css/theme-public.css#L149-L155)) are overwritten.
3. **theme-part-a.css** file, where all componens used for not-submitted user (like *inventory modal*, [example here](https://github.com/egovernment/eregistrations-salvador/blob/master/css/theme-part-a.css#L153-L159)) are overwritten.
4. **theme-part-b.css** file, where all componens used for submitted user and all official users (like *submitted menu*, [example here](https://github.com/egovernment/eregistrations-salvador/blob/master/css/theme-part-b.css#L5-L8)) are overwritten.

Any legacy browser overwriting should take place in separate files, in *system-name/css/legacy* folder. 

***

### Application specific CSS bundle configuration

For any application within eRegistration, one css file is created out of all css components files listed.
In Prototype there is one application *prototype*, so one css file is created.
Creating proper css file for application requires *linking css file* and *configuring it*:

- **Link application css file**, within *view/{applicationName}/index.html* (name should reflect application name) as [here](https://github.com/egovernment/eregistrations-salvador/blob/master/view/public/index.html#L27).
- **Configure** *{applicationName}/client/index.css* file, it should list all css files in given order that should be included in a bundle, as e.g. [here](https://github.com/egovernment/eregistrations-salvador/blob/master/public/client/css.index)

***

## Vertical rhythm and layout

### Vertical rhythm

**Vertical rhythm** in eRegistration can be defined as *the spacing and arrangement of components as the reader descends the page*. More basic information on VR cvan be found in this [article](http://24ways.org/2006/compose-to-a-vertical-rhythm/).  

**VR applies** to all elements (block and inline) that are placed in eRegistration system.  

**Base line** of VR in eRegistration Prototype is **22px**.

**Box components** like *section-primary* or *section-primary > form* children recive ***margin-bottom: 22px***, what gives proper VR between them (thair content is height and VR is protected by proper line-height). [Example](https://github.com/egovernment/eregistrations/blob/master/css/components/section-primary.css#L7-L11).
  
**Text components** like *headings*, *spans* or *paragraphs* have ***line-height*** defined in *base.css* to ***22px***. [Example](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L46-L52).  
If height of element is larger than 22px, line-height is doubled. [Example](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L72-L75).  
This rule controls height of components that contain text, making shour that height is multiplication of 22px, and elements in side are place with corect VR.

### Layout

**Layout** in eRegistration basic building block of layout is flexbox rule set on parents of controlled elements. For more information on how flexbox works, please refer to this [article](http://css-tricks.com/snippets/css/a-guide-to-flexbox/).  
No floats are allowed in main css components, positiong of elements can only be achieved via flexbox, inline-block, or if necessary postion relavie fixes. Floates are only allowed in legacy css override.

**Content component** - main container of all content is [***.content***](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L139-L143) container defined in *base.css*. Its width is limited to [**1070px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L6) and it is centered on page. All first chiled elements that width should be controlled and set to full-page width, should have this class defined. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/_main.js#L10).

***

## Responsivnes

**Responsivness** is achieved in eRegistration systems by [media-queries](https://github.com/egovernment/eregistrations/blob/master/css/form.css#L385), that are checking screen resolution. No user-agent detecting is applied and needed. Resposive styles can only by applied this way.

***Mobile resolution*** is turned on when screen resolution is less than [**640px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L7).  
***Minimum mobile resolution*** is set to [**320px**](https://github.com/egovernment/eregistrations/blob/master/css/base.css#L8)

**Control of responsive display** is mostly done by changing *flex-wrap* property set to *wrap* in mobile view. [Example](https://github.com/egovernment/eregistrations/blob/master/css/components/container-with-nav.css#L36-L39).

****

## Cross browser and legacy browsers

**Chrome** browser is basic browser that is used for development of styles in eRegistration systems. All styles should be build directly for this browser. 

**FireFox, Safari, Opera** are secondary browsers, that in most cases, will work as well as Chrome. But if necessary, theis browser hack are allowed in main and components css files.  
***FireFox*** hack can be made with special media selector **@-moz-document url-prefix()**. For more information on this hack please refer to this [article](http://css-tricks.com/snippets/css/css-hacks-targeting-firefox/). [Exemple](https://github.com/egovernment/eregistrations/blob/f2932305330b5af839a0a7f9305171b1701a6ab3/css/components/file-uploader.css#L37).  
***Safari*** hack not applied, but if needed can be added in any proper way.  
***Opera*** hack not applied, but if needed can be added in any proper way.

**Legacy browsers: IE8 - IE11** are treated in special css files, that are kept in *eregistrations/css/legacy* folder. All fixes are made by simplification of existing styles, and if necessary, set fix width and height. Layout can be fixed by applieing *floats* (but only in connection with *overflow: hidden* rule. [Example](https://github.com/egovernment/eregistrations/blob/master/css/legacy/components/container-with-nav.css#L1-L7).  
Rules are added to files that correspond to already created components. e.g. if we want to introduce some changes to legacy layer, for *css/base.css* file. We should add those rules to *css/legacy/base.css* file. Similar with components legacy fixes for *css/components/foo.css* should land in *css/legacy/components/foo.css*. Those files will be automatically picked and bundled, no extra effort is needed.

***

## Font icons

**Font Awsome** is used in eRegistration for icons. All iconse are not included, only those that are used. All new icons need to be added to icons file: *css/components/fa.css*.

**Adding new icon** can be made by selecting new icon from [this list](https://fortawesome.github.io/Font-Awesome/cheatsheet/) and adding class for this font in *css/components/fa.css*  

**Example** - adding *automobile icon* requiers adding its class and :before pseudo-element:

```
.fa-automobile {
	width: 1.2em;
}
.fa-automobile:before {
	content: "\f1b9";
}
```
Then in templates a element need to be added:

```
span({ class: 'fa fa-automobile' }, "Car")
```
"Car" text will not be shown when CSS is applied.

***

# Reusable components

***

## Forms

#### Basic Form

**Basic Form** - is basically made of ***ul*** and ***li*** elements wrapped in ***form*** element. Inside of ***li*** element there should be placed ***input*** element. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/_login.js#L14-L25).  
After ***ul*** element, a ***p*** element should be placed, wrapping ***submit*** type ***input***. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/_login.js#L26).  
***Form*** or ***ul*** wrapper element requires ***'form-elements'*** class in order for ***.radio*** and ***.hint*** elements to diplay properly.

```
form(
	ul({ class: 'form-elements' },
		li({ class: 'input' },
			input({ type: 'text' })
			)
		),
	p(
		input({ type: 'submit' })
	)
)

```

#### Table-like forms

***Table-like forms*** are used for displaying forms that are not placed on the left side of its containers, but slightly in the middle of screen. Mostly they are used for generating automatic forms based on model.  
Like *basic forms*, they are made of ***ul*** and ***li*** elements wrapped in ***form*** element.
  
Inside of ***li*** element, there is a ***div*** child, with automatically added *dbjs-input-component* class. This ***div*** contains two first level children - ***label*** element and ***div*** with ***'input'*** class element. 
 
In ***labele*** simply label text is placed.  
In ***div.input*** input of significant type is placed, folowd by ***span***'s:  
with ***statuses*** class for status marks;  
with ***error-message*** class for display of error text;  
with ***hint*** class for diplay of hint text. 

After ***ul*** element, a ***p*** with ***submit-placeholder input*** classes element should be placed, wrapping ***submit*** type ***input***.

*Table-like forms* are required to be placed in ***section-primary*** component.


```
form(
	ul({ class: 'form-elements' },
		li(
			div({ class: 'dbjs-input-component' },
				label('Lorem ipsum'),
				div({ class: 'input' },
					input({ type: 'text' }),
					span({ class: 'statuses' }),
					span({ class: 'error-message' }),
					span({ class: 'hint' })
					)
				)
			)
		),
	p({ class: 'submit-placeholder input' },
		input({ type: 'submit' })
	)
)

```

#### Checkboxes

Checkbox and its label should be placed in ***label*** with ***input-aside*** class.  
This ***label*** should contain two ***span*** children. First should contain ***input*** type ***checkbox***, and second simply label text. 


```
form(
	ul(
		li(
			label({ class: 'input-aside' },
				span(
					input({ type: 'checkbox' })
				),
				span(
					"Lorem ipsum"
				)
			)
		)
	)
)

```
#### Radio buttons

Radio buttons and its labels should be placed in ***ul*** with ***radio*** or ***radio multiline*** classes element where each ***li*** element corresponds to each radio button and its label.   

***Radio*** class element places radio buttons next to each other.  

```
form(
	ul({ class: 'radio' },
		li(
			label(
				input({ type: 'radio' }),
				"Lorem ipsum"
			)
		),
		li(
			label(
				input({ type: 'radio' }),
				"Lorem ipsum"
			)
		)
	)
)

```
***Radio multiline*** classes element places radio button under each other.

```
form(
	ul({ class: 'radio multiline' },
		li(
			label(
				input({ type: 'radio' }),
				"Lorem ipsum"
			)
		),
		li(
			label(
				input({ type: 'radio' }),
				"Lorem ipsum"
			)
		)
	)
)

```

#### Prepend and append inputs

***Prepend*** and ***append*** inputs can be used in any type of form. They are created by placing significant type of ***input*** in ***span*** with ***input-prepend*** or ***input-append*** class element.  
According to type *pre* or *append* type, ***span*** with ***add-on*** class and  appropriate content element need to be inserted before or after ***input*** element.

***Prepend input***

```
span({ class: 'input-prepend' },
	span({ class: 'add-on' }, "$"),
	input({ type: 'number' })
)

```
***Append input***

```
span({ class: 'input-prepend' },
	input({ type: 'number' }),
	span({ class: 'add-on' }, "$")
)

```

***

## Tables

#### Default tables

Basic styles for tables are kept in *css/table.css* file. By default table will be stripped, and displayed in container full width.  
Default table can contain table head, table body, actions column, non-responsive display.  
By adding ***actions*** class to table cells, and placing ***a*** or ***button*** element inside.  
By adding ***desktop-only*** class to table cells, cells will be hidden in *mobile view*.


#### Submitted-user-data-table

Mostly used across eRegistration system. Type of table that can be used to display objects and its properties.  
Each object can be placed in a separate row of table. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/users-admin.js#L31-L32)   

#### Responsive tables

Responsive table flips its header to be first column for every row of table. From the code perspective, this can be achived simply by adding property ***'responsive'*** seted to value ***'true'*** on table. [Example](https://github.com/egovernment/eregistrations/blob/master/view/prototype/user-submitted.js#L39) 

#### Statistics tables

For proper display of statistic tables, ***statistics-table*** class is introduced. This class make all content of statistics table smaller, so two tables can be placed side by side. 

There are two types of statistic tables: ***statistics-table-dual-main*** and ***statistics-table-dual-aside***.  
Classes introduced for purpose of setting proper width to statistic tables. 
[Example of usage](https://github.com/egovernment/eregistrations/blob/master/view/prototype/statistics.js#L27).

***

## Sections 

#### Section Primary

Mostly used across eRegistration system component. Presents a white background with gray border and little radius. Can contain any type of information, in example [forms](https://github.com/egovernment/eregistrations/blob/master/view/prototype/guide.js#L17), [lists](https://github.com/egovernment/eregistrations/blob/master/view/prototype/guide.js#L86), or [freeform text](https://github.com/egovernment/eregistrations/blob/master/view/prototype/guide.js#L133). 

All elements that are first line children of section primary, will get automaticaly 22px margin bottom.

*Table-like forms* are required to be placed in ***section-primary*** component.

#### Section Warning

Can be used for display of warning message to user. Presents a white background with gray left-border and no radius.  
In Prototype used [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/submission.js#L14-L15).


#### Tab navigation section

Can be used for display of white background with gray border and little radius container, that also have number of tabs at its top. Requiers ***a*** elements with ***tab*** class for tabs placed as first children, and after requires a div element as main conatiner for tab.  
Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/official-user.js#L102-L112).

```
section({ class: 'section-tab-nav' },
	a({ class: 'tab' }, "First Tab"),
	a({ class: 'tab' }, "Second Tab"),
	div("Tab content container")
)

```
***

## Container with navigation

Container with navigation component is responsible for displaying all components require a text on one side of container, and a navigation or any other links or buttons on the other side of this container. Mostly used for display of heading and on its right side buttons.

Markup is flexible: - one container block element is required, with ***container-with-nav*** class. Two children or *text* and child element are required.  
Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/official-document.js#L16-L25).

```
div({ class: 'container-with-nav' },
	"Lorem ipsum",
	div("Navigation")
)

```
***

## Labels

Labels can be used at any text. For usage of labels, text that should be wrapped in label, need to be wrapped in ***span*** with ***label-reg*** class inline element (like span).

There are five types of labels:  
***label-reg*** - simple gray label  
***label-reg.ready*** - orange label  
***label-reg.rejected*** - red label  
***label-reg.approved*** - green label  
***label-reg.info*** - blue label

Combined classes need to be used for color labels to display properly: ***label-reg*** and type class, i.e.. ***ready***

Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/statistics.js#L128-L131).


```
span({ class: 'label-reg' }, "Lorem ipsum");

```
*** 

## Buttons

There are various links displayed as buttons used in eRegistrations Prototype. They are ***a*** element with significatn class. ***Button*** elements are only used in ***form*** elements. 

#### Button main

Can be used on ***links***, ***buttons*** and ***inputs*** with ***submit*** type. Creates a grey button with total height of 44px. Can be combined with color changing classes:  
***button-main-success*** - green color button
***button-main-error*** - red color button

Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/revision.js#L114).

#### Post button

Post button component is a combinance of elements created out of postButton() function. Markup created cosists of ***form*** and ***submit*** type ***button***.  
Class for button can be added by adding ***buttonClass*** property in arguments object.  
Text on button can be added by adding ***value*** property in argument object.

Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/revision.js#L112-L113)

```
postButton(
	{ 
		buttonClass: 'button-main button-main-success', 
		value: "Success" 
	}
);

```

#### Resource link button

Resource link is used for ***a*** elements, and displayes it as a light gray button. 
This type of button can be used for downloading files.  
Class ***button-resource-link*** is used for creating this type of button. 

Example can be found [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/official-document.js#L20)

#### Next step button

***

## Error-main

Can by used for display of important to user message. Presents a white background with red border and little radius. Also can contain a red exlamation mark.  
In Prototype used [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/forms.js#L12-L13).

***

## Info-main

Can by used for display of information type message to user. Presents a white background with gray border and little radius. Also can contain a special list of informations needed to be displayed.  
In Prototype used [here](https://github.com/egovernment/eregistrations/blob/master/view/prototype/forms.js#L15).
