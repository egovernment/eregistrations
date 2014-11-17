# Sections

**Sections** are a set of components which organize most of the application's forms. Unless your form is custom there is a good chance you should use **Sections** to create it.

**Sections should be used for building:**
- User forms (second step, after guide of user application)
- Send application forms (lst step of user application)

## Overview

**Sections** are used as an abstraction layer over models to group model data for usage in client. They are then used in views to generate forms or display data systematically.

Let's say we have a form in which we want to use fields from different models and we need to add some (show/hide) logic between those fields, without **Sections** we would write it all directly in views. We would also need to include some legacy handling with radio/select matches etc, with **Sections** we can define all of this in a concise way in model.

## Working With Sections
We start by declaring that certain property will be a container for our section objects.

```javascript
var defineFormSections = require('eregistrations/model/form-sections');

defineFormSections(User, 'formSections');
```

Where User is a constructor of an entity for which we want to define formSections (it's mostly the main application user, but it may also be a partner or any other entity).  

**eregistrations/model/form-sections** takes the name of property under which we want to have our sections.
After execution of above code we should have an empty (nested map) collection under `User.prototype.formSections` property (note: under prototype, not under constructor).

Now we can define some actual sections, but first we need a model to which we refer:

```javascript
User.prototype.defineProperties(
    name: { type: db.StringLine, required: true },
    isNice: { type: db.Boolean, value: true, required: true },
    explainWhyNotNice: { type: db.Boolean, required: true }
    address: { type: db.Address, nested: true },
    partners: { type: db.Partner, multiple: true }
)

Address.prototype.defineProperties(
    country: { type: db.StringLine, required: true },
    street: { type: db.StringLine }
)

Partner.prototype.defineProperties(
    name: { type: db.StringLine }
    isShareholder: { type: db.Boolean }
)
```

Let's say we want to have a form which will allow edition of following fields: `user.name`, `user.isNice`, `user.explainWhyNotNice`, `user.address.country`, `user.address.street`.

Obviously, when someone is _nice_ we don't want to show the field asking for explanation why the user is not _nice_ (_if !user.isNice -> show user.explainWhyNotNice_).

We can either create one form with all the fields or break it into sub sections. Let's see how we would have created a form with no subsections. This case is handled by FormSection class:

### FormSection

```javascript
var FormSection = require('eregistrations/model/form-section');

// Define a Type that would represent a specific section
FormSection.extend('GeneralInfoFormSection', {}, {
	// Form POST url
	actionUrl: { value: 'general' },
	// Section label
	label: { value: "User information" },
	// Property names of all involved fields (order is significant)
	propertyNames: { value: ['name', 'isNice', 'explainWhyNotNice',
		'address/country', 'address/street'] }
});

// Assign created Type to chosen section at User.prototype.formSections
User.prototype.formSections.getOwnDescriptor('generalInfoFormSection').type = db.GeneralInfoFormSection;

// As isExplainWhyNotNiceApplicable field should be shown conditionally we define a condition for it
User.prototype.define('isExplainWhyNotNiceApplicable', {
    value: function () {
        return !this.isNice;
    }
});
```

Use defined sections to generate forms in a view:

```javascript
var generateFormSections = require('eregistrations/components/generate-form-sections');

h1('User Data');
div(generateFormSections(User.prototype.formSections));
```

We import section's view generator and use it on the formSections field which we defined for user.
This should lead to display of desired form. If the controllers are working (they still need to be configured manually) and we configured correct url in GeneralInfoFormSection.constructor.actionUrl, we should have fully working form by now.

What if we want to have the same form but grouped in two subsections: Personal Information, Address Details? We would use FormSectionGroup for that:

### FormSectionGroup

Let's assume we want to have two subsections: _Personal Information_ and _Address Details_.  
In _Personal Information_ we want to have: `user.name`, `user.isNice`, `user.explainWhyNotNice`.  
In _Address Details_ we'll have: `user.address.country`, `user.address.street`:

```javascript
var FormSection      = require('eregistrations/model/form-section')
  , FormSectionGroup = require('eregistrations/model/form-section-group');

FormSectionGroup.extend('GeneralInfoFormSection', {}, {
	actionUrl: { value: 'general-infp' },
	label: { value: "User Information" } }
});

FormSection.extend('PersonalInformationSection', {}, {
    label: { value: "Personal Information" }
    propertyNames: { value: ['name', 'isNice', 'explainWhyNotNice'] }
});

FormSection.extend('AddressDetailsSection', {}, {
    label: { value: "Address Details" }
    propertyNames: { value: ['address/country', 'address/street'] }
});

User.prototype.formSections.getOwnDescriptor('generalInfoFormSection').type = db.GeneralInfoFormSection;

User.prototype.formSections.generalInfoFormSection.sections.getOwnDescriptor('personalInformationSection').type = db.PersonalInformationSection;
User.prototype.formSections.generalInfoFormSection.sections.getOwnDescriptor('addressDetailsSection').type = db.AddressDetailsSection;

User.prototype.define('isExplainWhyNotNiceApplicable', {
    value: function () {
        return !this.isNice;
    }
});
```

So, we extended FormSectionGroup, and twice FormSection. After that we added GeneralInfoFormSection to formSections, and added PersonalInformationSection and AddressDetailsSection to GeneralInfoFormSection's sections field.

### FormEntitiesTable

In eregistrations we usually need to create a table which groups objects of certain type/types which belong to user.
For example a table of _partners_. There is a section class to handle such cases `FormEntitiesTable`.

`FormEntitiesTable` is used for display of already created entities, but it does not provide configuration for forms with which we add or update given entity, as this again is done with _Sections_ configuration based on model of given entity (we just need to follow the same steps we used for user).

As a matter of fact we should begin our work with partners (or any any other external entities we need to assign to user) with preparation of **Sections** config for them.
Such setup might look like this:

```javascript
// Some model to which we'll refer
Partner.prototype.defineProperties({
    name: { type: db.StringLine }
    isShareholder: { type: db.Boolean }
});

var defineFormSections = require('eregistrations/model/form-sections')
  , FormSection        = require('eregistrations/model/form-section');

defineFormSections(Partner, 'formSections');

FormSection.extend('PartnerFormSection', {
    buildActionUrl: { value: true }
}, {
	actionUrl: { value: 'partner' },
	label: { value: "Partner information" },
	propertyNames: { value: ['name', 'isShareholder'] }
});

Partner.prototype.formSections.getOwnDescriptor('partnerFormSection').type = db.PartnerFormSection;
```

Form created around the above form section definition will have `section.actionUrl + '-add'` url (in that case `partner-add`) url for partner creation  and `section.actionUrl + '/' + <partnerId>` url for edition of existing partner.

Let's now create **FormEntitiesTable** for partners.

```javascript
var EntitiesTable = require('eregistrations/model/form-entities-table')(db)
  , TabularEntity = require('eregistrations/model/form-tabular-entity')(db)

EntitiesTable.extend('PartnersTableSection', {}, {
	baseUrl: { value: 'partner' },
	propertyName: { value: 'partners' },
	entityTitleProperty: { value: 'name' },
	sectionProperty: { value: 'formSections' }
});

db.PartnersTableSection.entities.add(new TabularEntity({
	propertyName: 'name'
}));
db.PartnersTableSection.entities.add(new TabularEntity({
	propertyName: 'isShareholder'
}));

user.formSections.getOwnDescriptor('partnersTableSection').type =
	db.PartnersTableSection;
```

Explanation of some `EntitiesTable` properties:

**propertyName** tells us on what user's property are defined our entities (in this example it leads us to `User.prototype.partners`).  
**sectionProperty** which should expose the property name under which the form sections are defined on our partner, in our case it's `formSections`.  
 **entityTitleProperty** is where we tell **EntitiesTable** from which partner's property it should read every entity's title (it will be used after user has been submitted).  
**baseUrl** url base for add/edit form views. After defining this, table links and postButtons will have the correct action urls, so that all is left to do is to configure routing and controllers.

#### Defining FormEntitiesTable layout

`EntitiesTable` is used to display in a tabular fashion certain entities defined on user (in our example these entities are partners). The table will need to have columns, and with `TabularEntity` class you define characteristics of each column

`TabularEntity` just needs to have one property: `propertyName`, which tells us what partner's property will be displayed in a given column.

The order of adding `TabularEntity` to `EntitiesTable.entities` property determines the order of table columns. If everything worked well, you should now see an entities table in your view, together with other sections you defined previously.


### Conditional section resolution

Sometimes we have a section, that's displayed conditionally only if user explicitly decides so. Very common use case is _Business Address_ section, which is optional, and by default we leave user with preselected choice _It's same as home address_, still user may opt-out and fill custom address for his business.

Such sections can be configured with help of `resolventValue` property.

#### Example:

Let's add 'isResident' property to our User model. It will show/hide all the address depending on true/false value.

```javascript

User.prototype.defineProperty(
    'isResident': { type: db.Boolean, required: true}
)

```

Now we need to adjust the our sections definitions.
 
 ```javascript
 FormSection.extend('PersonalInformationSection', {}, {
     label: { value: "Personal Information" }
     propertyNames: { value: ['name', 'isNice', 'explainWhyNotNice', 'isResident'] }
 });
 
 FormSection.extend('AddressDetailsSection', {
    resolventValue: { value: true }
 }, {
     label: { value: "Address Details" }
     propertyNames: { value: ['address/country', 'address/street'] }
     resolventProperty: { value: 'isResident' }
 });

 ```
 
Aside of `resolventProperty`, we also should define `resolventValue` on the constructor (it tells us what value will trigger section visibility).

###Sections after submission###

Once user has submitted his application we display his data in _read-only_ view, both in the user-submitted's and official's view. There are also prepared DOM bindings for that:

```javascript
var generateSections = require('eregistrations/components/generate-sections');

h1('User Data');
div(generateSections(User.prototype.formSections));

```

