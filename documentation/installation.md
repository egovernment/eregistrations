# Installation of eRegistrations system

## Needed software

Application can be deployed on both OSX/\*nix and Windows systems. It needs following software to be installed:

* __Node.js__ - http://nodejs.org/ - v0.4 in it's **latest** release

### Image processing utilties:

On OSX we recommend to use [Homebrew](http://brew.sh/) to install below utitlites

* __GraphicsMagick__ - http://www.graphicsmagick.org/download.html
* __GhostScript__ - http://www.ghostscript.com/download/gsdnld.html __it needs to be in the same architecture version (32bit or 64bit) as GraphicsMagick__. GhostScript helps GraphicsMagick to generate thumbnails of PDF documents.

### Compilation related utilities

In \*nix systems normally no additional work needs to be done. Still for Windows, it's important that all dependencies mentioned below are ensured.

Few packages that we use are written in C++ and need to be compiled. For that needed software needs to be ensured:
- [node-gyp](https://github.com/TooTallNate/node-gyp#installation) ("You will also need to install" section)
- [node.bcrypt.js](https://github.com/ncb000gt/node.bcrypt.js#dependencies) need to be installed on your machine. _Note: On Windows install full (not lite) version of OpenSSL_.

After all needed software is installed and application code is downloaded, compile packages with following command (needs to be run in application path):

## Project compilation

Few packages needs compilation, running below ensures that

* `$ npm rebuild` __[Note: on Windows 8 it needs to be run in VS Command Prompt](https://github.com/TooTallNate/node-gyp/issues/177#issuecomment-12184651)__

## Environment configuration

What's left is environment configuration. Create _env.js_ file in main path of application, as follows:

```javascript
'use strict';

module.exports = require('mano').env = {
	// Development or production environment
	// If true then client JS and CSS bundles are refreshed at each request
	// (no server restarts are needed to see changes in client specific code)
	// Additionally note:
	// - Any model changes require full server restarts to be propagated
	// - Any changes to server side script require restarts of server process
	//   (can be done via faster `npm run quick-start)
	dev: true,

	// HTTP server port
	// Must not be taken by any other app in your environment
	port: 3177,

	// URL at which application would be served
	// Information used e.g. for email notifications, but also for cookies resolution
	// It must be accurate, for application to work properly
	url: 'http://localhost:3177/',

	// Legacy pool functionality
	// It's about server-side HTML rendering for legacy browsers. Leave it to 'true'
	legacyPool: true,

	// Secret string
	// Random string (as typed by your cat).
	// Used to maintain authentication sessions between server restarts
	secret: 'asdfq3132142adsfasdfa3',

	// SMTP settings
	// Set `logOnly: true`, if you do not wish to send real emails but prefer to see
	// them just in server log
	smtp: {
		host: 'localhost',
		from: 'eRegistrations Demo <eregistrations@eregistrations.org>',
		logOnly: true
	}
};
```

### Database configuration

The eRegistrations system is built to work with any database. By default [plain text](https://github.com/medikoo/dbjs-persistence/tree/master/text-file) database driver is used, it's efficient enough for common eRegistrations setup and it doesn't require any specific configuration to be provided.

The following database engines have prepared dedicated dbjs drivers (engines not mentioned in a list can have a driver prepared on request in 1-3 days)

- [LevelDB](http://leveldb.org/) -> [dbjs-level](https://github.com/medikoo/dbjs-level)
- [MongoDB](https://www.mongodb.com) -> [dbjs-mongo](https://github.com/medikoo/dbjs-mongo)

If there's intention to use one of above engines, the database engine and dbjs driver need to be installed separately (installation instructions can be found in driver repository), and it's usage needs to be configured in  `env.js`, as g.:

```javascript
module.exports = require('mano').env = {
	...
  db: {
    driver: require('dbjs-level'), // Store data in LevelDB database
    // .. Driver configuration properties if needed ..
  }
	...
};
```

## Setup administrator account

To be able to additionally access site administrator functionality, _users admin_ account needs to be created. To do so run following command and follow instructions:

* `$ npm run create-users-admin`

While logged in as users admin, you can create accounts of institution workers, which can review and process files.

User administrators and institution workers log in into application using same login form as regular merchants.

## Deployment

Start server:

* `npm start` - starts the server

After that application should be running on port as configured in env.js
