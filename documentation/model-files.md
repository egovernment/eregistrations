# BusinessProcess model files organization

Below paths are relative to `/model/business-process/` context.

### /costs
Configuration of costs, each cost should be configured in individual file

### /certificates.js
Configuration of certificates

### /data-forms
Configuration of form sections for step 1, with each section configured in individual file

### /determinants.js
Configuration of computable properties used to resolve process characteristics

### /fields.js
All properties used for guide and forms.
Computable properties used to resolve the process characteristics should be defined in `determinants.js`

### /custom-fields.js
Custom fields that are defined strictly programmatically for custom features implemented programmaticaly  
(Note: it should not be understood as customisation to fields.js).

### /guide.js
Configuration of guide form section

### /nested-entities
Model for nested entities (e.g. branches, representatives) used in dataForms.
Each entity should have its folder with `fields.js` and `data-forms.js` files,e.g
```
/nested-entities/branch/fields.js
/nested-entities/branch/data-forms.js
```

### /processing-steps
Configuration of properties needed for Part B of the process

Each step can be represented by one file as e.g.
```
/processing-steps/inspection-report.js
```

or folder of files, e.g.
```
/processing-steps/inspection-report/fields.js
/processing-steps/inspection-report/data-form.js
```

There should be also `/processing-steps/index.js` file, which describes flow between processing roles

### /registrations
Configuration of registrations, where each registration is configured in individual file

### /requirement-uploads.js
Configuration of requirement uploads

### /requirements.js
Configuration of requirements

### /submission-forms
Configuration of submission form sections, with each section configured in individual file
