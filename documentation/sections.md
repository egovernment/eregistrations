# Sections

**Sections** are a set of components which organize most of the application's forms. Unless your form is custom there is a good chance you should use **Sections** to create it.

---
## Overview

**Sections** are used as an abstraction layer over models to group model data for usage in client. They are then used in views to generate forms or display data systematically.
Let's say we have a form in which we want to use fields from different models and we need to add some (show/hide) logic between those fields.
Without **Sections** we would write it all directly in views. We would also need to include some legacy handling with radio/selct matches etc.
With **Sections** we can define all of this in a concise way in model.

##Working With Sections##
We start by declaring that certain property will be a container for our section objects.

```javascript
var defineFormSections = require('eregistrations/model/form-sections');

defineFormSections(User, 'formSections');
```

Where User is a constructor of an entity for which we want to define formSections (it's mostly the main application user, but it may also be a partner or any other entity).
**eregistrations/model/form-sections** takes the name of property under which we want to have our sections.
After execution of above code we should have an empty collection under User.prototype.formSections (note: under prototype, not under constructor).
Now we need to define some actual sections.
let's say we have following models:

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

Now, we want to have a form which will correspond to such fields: user.name, user.isNice, user.explainWhyNotNice, user.address.country, user.address.street.
Obviously, when someone is nice we don't want to show the field asking for explanation why the user is not nice (if !user.isNice -> show user.explainWhyNotNice).
We can either create one form with all the fields or break it into sub sections. Let's see how we would have created a form with no subsections. This case is handled by FormSection class.

###FormSection###

1. Prepare definition in model

```javascript
var FormSection = require('eregistrations/model/form-section');

FormSection.extend('GeneralInfoFormSection', {}, {
	actionUrl: { value: 'save-user' },
	label: { value: "User information" },
	propertyNames: { value: ['name', 'isNice', 'explainWhyNotNice',
		'address/country', 'address/street'] }
});

User.prototype.formSections.getOwnDescriptor('generalInfoFormSection').type = db.GeneralInfoFormSection;

User.prototype.define('isExplainWhyNotNiceApplicable', {
    value: function () {
        return !this.isNice;
    }
});
```

That's our model definition, we extended FormSection and then embedded our freshly created GeneralInfoFormSection class under User.prototype.formSections.generalInfoFormSection (you should be able to access it now).
After that we just added some code to resolve our show/hide explainWhyNotNice logic. We simply created a getter based on special convention. Convention is following is<CapitalizedNameOfPropertyToResolve>Applicable.
So in our case it's isExplainWhyNotNiceApplicable, as the property which visibility depends on isNice is explainWhyNotNice.

2. Use it in the view

```javascript
var generateSections = require('eregistrations/components/generate-form-sections');

h1('User Data');
div(generateSections(User.prototype.formSections));

```

We import section's view generator and use it on the formSections field which we defined for user.
This should lead to display of desired form. If the controllers are working and we passed correct value in GeneralInfoFormSection.constructor.actionUrl, we should have fully working form by now.
What if we want to have the same form but grouped in two subsections: Personal Information, Address Details? We would use FormSectionGroup for that.

###FormSectionGroup###

Let's assume we want to have two subsection: Personal Information, Address Details. In Personal Information we want to have: user.name, user.isNice, user.explainWhyNotNice. In Adderss Details we'll have: user.address.country, user.address.street.
The only differnce to **FormSection** is in model.

1. Prepare definition in model

```javascript
var FormSection      = require('eregistrations/model/form-section')
  , FormSectionGroup = require('eregistrations/model/form-section-group');

FormSectionGroup.extend('GeneralInfoFormSection', {}, {
	actionUrl: { value: 'save-user' },
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
As stated above 2. would look exactly the same as for **FormSection**
