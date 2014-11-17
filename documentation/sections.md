# Sections

**Sections** are a set of components which organize most of the application's forms. Unless your form is custom there is a good chance you should use **Sections** to create it.
**Sections** should be used for building main user form, part of submission form and user data displayed after user has submitted the form.

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
After that we just added some code to resolve our show/hide explainWhyNotNice logic. We simply created a getter based on special convention. Convention is following is&lt;CapitalizedNameOfPropertyToResolve&gt;Applicable.
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

###FormEntitiesTable###

Up until now we were using **Sections** to build forms with fields corresponding to our main user's model. In eregistrations we usually need to create a table which groups objects of certain type/types which belong to user.
For example a table of partners. There is a section class to handle such cases - **FormEntitiesTable**. It us important to understand that **FormEntitiesTable** is used for display of already created entities. It does not support forms for adding an updating those entities.
However, as mentioned earlier we can prepare a **Sections** configuration for such entities as partners (we just need to follow the same steps we used for user).
As a matter of fact we should begin our work with partners (or any any other external entities we need to assign to user) with preparation of **Sections** config for them.
Such setup might look like this:

```javascript
/* our previously defined Partner model

Partner.prototype.defineProperties(
    name: { type: db.StringLine }
    isShareholder: { type: db.Boolean }
)
*/

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

So as you can see we've created **Sections** setup just like for user. There is just one **PartnerFormSection** property which requires explanation.
It's 'buildActionUrl'. When set to true, this property will generate convention based form submission urls. The convention is based on actionUrl value, so in our example 'partner'.
Form created around the above form section definition will have <currentLocation>partner-add url for adding new partners and <currentLocation>partner/<partnerId> url for edition of existing partner.
We now have all we need to create **FormEntitiesTable** for partners.

```javascript
var EntitiesTable          = require('eregistrations/model/form-entities-table')(db)
  , TabularEntity          = require('eregistrations/model/form-tabular-entity')(db)

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

Ok, so what has just happened? We extended **EntitiesTable** with **PartnersTableSection**. This time we didn't define **propertyNames** (like we did for **FormSections**).
We defined **propertyName** it tells us on what user's property are defined our entities (partners). We also defined **sectionProperty** which should expose the property name under which the form sections are defined on our partner, in our case it's 'formSections'.
So, we now now that our the entities we want to show in a table are under 'partners' property of user and that the sections of our partner entity are defined under 'formSections' property.
The **entityTitleProperty** is where we tell **EntitiesTable** from which partner's property it should read every entity's title (it will be used after user has been submitted).
The **baseUrl** is where we define the core of the url for opening the add/edit form, as well as deletion url.
Again, the convention is like with **buildActionUrl** set to true on **FormSection** and **FormSectionGroup**: <currentUrl>/<baseUrl>-add, <currentUrl>/<baseUrl>/<partnerId>, <currentUrl>/<baseUrl>/<partnerId>/delete.
Note: you only need to define **baseUrl**, and the table links and postButtons will have the correct action urls, so that all is left to do is to configure routing and controllers.
One last thing that might be puzzling is **TabularEntity** and 'entities' property on **EntitiesTable**. Remember that **EntitiesTable** is used to display in a tabular fashon certain entities defined on user (in our example these entities are partners).
The table will need to have columns, but should it list all the properties of partner in columns, and what should be the order?
That is where **TabularEntity** comes in. You can think of **TabularEntity** objects as definitions of columns. **TabularEntity** just needs to have one property: **propertyName**. The **propertyName** property on **TabularEntity** tells us what partner's property will be displayed in a given column.
The order of adding **TabularEntity** to **EntitiesTable**'s entities property determines the order of table columns. If everything worked well, you should now see an entities table in your view, together with other sections you defined previously.


###Resolving Form Logic###
It has been mentioned already that we can (and should) use sections for doing form's show/hide logic. It was shown already how to create a show/hide dependency inside a form by using is<propertyName>Applicable.
Sometimes we want to hide entire section depending on one value. It should be accomplished differently than with previously shown technique.
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
 
 So, we added the 'isResident' to **PersonalInformationSection**'s **propertyNames**. More interesting is what happened in **AddressDetailsSection**.
 We added **resolventProperty** to the prototype (it tells us which property resolves section's visibility). We also added **resolventValue** on the constructor (it tells us what value will trigger the section's visibility).
 That should do it, when you open the form in the browser you should now see the **AddressDetailsSection**'s fields show and hide as you select different values for isResident.
 
 You should now have a grasp on two ways of resolving form show/hide logic:
 1. Usage of is<propertyName>Applicable
 2. Defining **resolventProperty** and **resolventValue**.

###Sections after submission###

Once user has submitted his application we display his data both in the user-submitted's and offical's view. With **Sections** we can display this data in a similar way we displayed the section based forms before.
We just need to use different generate. So in the view we could do it like this:

```javascript
var generateSections = require('eregistrations/components/generate-sections');

h1('User Data');
div(generateSections(User.prototype.formSections));

```

That's all you should have to do in submitted-user's data view if all the definitions are OK.
