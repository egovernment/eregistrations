# Model

## An overview of eregistrations model

_Currently just a stub linking latest versions of models which will be used in new systems, and to which existing systems will be updated_.

#### Person

https://github.com/egovernment/eregistrations/blob/master/model/person.js

Base for User class, and other classes which describe some type of human person role.

#### User

https://github.com/egovernment/eregistrations/tree/master/model/user

User account class. Each registered user in a system is represented with user instance

#### Institution

https://github.com/egovernment/eregistrations/blob/master/model/institution.js

Specific institutions are defined in specific projects as _named_ objects (so instances of `Institution` class)

---

#### BusinessProcess

https://github.com/egovernment/eregistrations/tree/master/model/business-process-new

Business process is a main class in system, It represents a user request to e.g. obtain speciic registrations, or to update existing registration.

`BusinessProcess` class definition is organised with following sub modules:

##### base

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/base.js

Base properties

##### Part A

###### registrations

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/registrations.js

Resolution of requested registrations

###### certificates

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/certificates.js

Resolution of certificates resolved out of requested registrations

###### costs

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/costs.js

Resolution of costs resolved out of requested registrations

###### requirements

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/requirements.js

Resolution of requirements resolved out of requested registrations

###### guide

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/guide.js

Step 0 in Part A

Resolution of guide related properties and its progress

###### data forms

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/data-forms.js

Step 1 in Part A

Resolution of data forms.

###### requirement uploads

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/requirement-uploads.js

Step 2 in Part A

Resolution of requirement uploads resolved out of requirements resolved out of requested registrations

###### payment receipt uploads

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/payment-receipt-uploads.js

Step 3 in Part A

Resolution of payment receipt uploads resolved out of costs resolved out of requested registrations

###### submission forms

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/submission-forms.js

Step 4 in Part A

Resolution of submission forms

##### Part B

###### flow

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/flow.js

Resolution of process flow related properties (status, and isSubmitted, isRejected etc.)

###### processing steps

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/processing-steps.js

Resolution of official processing steps

##### My Account

###### derived

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/derived.js

Resolution of related business processes, and whether they can be derived with other business processes

###### documents

https://github.com/egovernment/eregistrations/blob/master/model/business-process-new/documents.js

Resolution of cumulated (certificates + requirement uploads) documents collections

#### External classes used in BusinessProcess definitions

##### Document

https://github.com/egovernment/eregistrations/blob/master/model/document.js

Describes a document which can be either an obtained certificate or uploaded requirement.

Each specific document is represented with class that extends `Document`. Then documents are defined in model as _nested_ objects on `BusinessProcess.prototype`.

Location of nested documents:
* _certificates_, at `businessProcess.certificates.map` map as e.g. `businessProcess.certificates.map.municipalityCertificate`
* _requirementUpload documents_ at `businessProcess.requirementUploads.map` map as e.g. `businessProcess.requirementUploads.map.passport.document`

##### Registration

https://github.com/egovernment/eregistrations/blob/master/model/registration-new.js

Registrations are defined as _nested_ objects on `BusinessProcess.prototype.registrations.map`

##### Cost

https://github.com/egovernment/eregistrations/blob/master/model/document.js

Registration cost. Costs are defined as _nested_ objects on `BusinessProcess.prototype.costs.map`

##### Requirement

https://github.com/egovernment/eregistrations/blob/master/model/requirement.js

Requirements are defined as _nested_ objects on `BusinessProcess.prototype.requirements.map`

##### RequirementUpload

https://github.com/egovernment/eregistrations/blob/master/model/requirement-upload.js

RequirementUploads are defined as _nested_ objects on `BusinessProcess.prototype.requirementUploads.map`

##### PaymentReceiptUpload

https://github.com/egovernment/eregistrations/blob/master/model/payment-receipt-upload.js

PaymentReceiptUploads are defined as _nested_ objects on `BusinessProcess.prototype.paymentReceiptUploads.map`

##### FormSection

https://github.com/egovernment/eregistrations/blob/master/model/form-section-base.js  
https://github.com/egovernment/eregistrations/blob/master/model/form-section.js  
https://github.com/egovernment/eregistrations/blob/master/model/form-section-group.js  
https://github.com/egovernment/eregistrations/blob/master/model/form-section-entities-table.js

FormSections are defined as _nested_ objects at `BusinessProcess.prototype.dataForms` and `BusinessProcess.prototype.submissionForms`.  
Additionally there's a guide determinants forms section defined at `BusinessProcess.prototype.determinants`,
and each `ProcessingStep` and `Document` has defined `dataForm` form section nested instance.

For documentation on form sections see: https://github.com/egovernment/eregistrations/blob/master/documentation/sections.md

##### ProcessingStep

https://github.com/egovernment/eregistrations/blob/master/model/processing-step.js

ProcessingSteps are defined as _nested_ objects on `BusinessProcess.prototype.processingSteps.map`
