# Server deployment

All eRegistrations applications that are hosted on UNCTAD server are served from `eregistrations.org` server.

Access to that server is provided to chosen developers.

Application processes are maintained via [pm2](http://pm2.keymetrics.io/) process manager.

[Monitoring panel](https://app.keymetrics.io/#/bucket/579218e1b913defd31e25c1d/dashboard) showcasing health of all applicaiton proceses is accessible for invited users.

## Deploy assignments

Table of developer to application assignments. Assigned developer is responsible for restarts of given server.

Server restarts for one application should be handled by one person, there should be not case where two or more developers take care of deploy tasks of one application in same period of time.

<table>
<thead><tr><th>System name</th><th>Assigned developer</th></tr></thead>
<tbody>
<tr><td>Guatemala</td><td>Marek Tuchowski <a href-"https://github.com/mtuchowski/">@mtuchowski</a></td></tr>
<tr><td>Lomas</td><td>Kamil Gruca <a href-"https://github.com/kamsi/">@kamsi</a></td></tr>
<tr><td>Salvador</td><td>Marek Tuchowski <a href-"https://github.com/mtuchowski/">@mtuchowski</a></td></tr>
<tr><td>Tanzania</td><td>Kamil Gruca <a href-"https://github.com/kamsi/">@kamsi</a></td></tr>
</tbody>
</table>

## How often do restarts should be handled

### Production systems

If there any updates pending, then __once a day__, at time when there's lowest traffic on system (so e.g. for central america, in the morning or midday Europe time).

### Development systems

If there any updates pending, then ideally __twice a day__, before lunch and before an end of a day.
Additional restarts may be requested in some urgent cases, e.g. critical bug fixing

## How to restart applications

When logged in to server, we can see the list of all running applications via running command `pm2 list`

```
$ pm2 list
● Agent online - public key: 9y5fsl6wlc8ybt3 - machine name: Ubuntu-1404-trusty-64-minimal - Web access: https://app.keymetrics.io/
┌─────────────────┬────┬──────┬───────┬────────┬─────────┬────────┬──────────────┬──────────┐
│ App name        │ id │ mode │ pid   │ status │ restart │ uptime │ memory       │ watching │
├─────────────────┼────┼──────┼───────┼────────┼─────────┼────────┼──────────────┼──────────┤
│ els             │ 0  │ fork │ 19491 │ online │ 0       │ 62m    │ 622.043 MB   │ disabled │
│ gt-dev          │ 1  │ fork │ 19500 │ online │ 0       │ 62m    │ 311.262 MB   │ disabled │
│ gt              │ 2  │ fork │ 24991 │ online │ 0       │ 46m    │ 350.273 MB   │ disabled │
│ ldz-dev         │ 3  │ fork │ 19526 │ online │ 0       │ 62m    │ 125.492 MB   │ disabled │
│ ldz-old         │ 4  │ fork │ 19535 │ online │ 0       │ 62m    │ 92.164 MB    │ disabled │
│ ldz             │ 5  │ fork │ 19556 │ online │ 0       │ 62m    │ 193.238 MB   │ disabled │
│ proto           │ 6  │ fork │ 19593 │ online │ 0       │ 62m    │ 199.742 MB   │ disabled │
│ tz-dev          │ 7  │ fork │ 19610 │ online │ 0       │ 62m    │ 117.992 MB   │ disabled │
│ tz              │ 8  │ fork │ 19643 │ online │ 0       │ 62m    │ 371.363 MB   │ disabled │
│ notify-on-crash │ 9  │ fork │ 19664 │ online │ 0       │ 62m    │ 31.395 MB    │ disabled │
└─────────────────┴────┴──────┴───────┴────────┴─────────┴────────┴──────────────┴──────────┘
```

Application name reflects path at which it is located in home folder. To fully update running application we need to pursue following steps:

__Important: It should be ensured that update process is as short as possible__

##### 1. Stop running process

Run command `pm2 stop {app-name}` on chosen application, e.g. if we want to stop _els_ (salvador) app, we do:

    $ pm2 stop els

##### 2. (if needed) update translations and/or global data

At application path via `git status` command we check whether there are any not commited changes in either translations (`i18n-messages.json` file) or global data (`data` folder). If there are, we need to submit them to main repository before we proceed with restart.  

There's a preconfigured script that helps with that process:

2.1 Run `update-translations` command. It'll commit changes to `server-translations` branch and push it to orign repository.  

2.2. On github we open pull request of `server-translations` branch against `master` and review it.  
During review we need to check whether translations are technically correct:
- Translations variables are used 1:1, e.g. it happened that translators tried to translate variable names. `I'm ${ fullName }`, was translated as `I'm ${ primerNombre }`. We should prevent taking in such changes (in such case please correct errors before merging the changes)
- Messages that relate to model values of type `StringLine` (e.g. `legend`) must not introduce new line characters (if we accept such change, then server will crash at model initialization).

2.3 After confirming that changes proposed with `server-translations` are fine, we merge the changes to master

##### 3. Update application to latest version

    $ git pull

##### 4. Rebuild all client files and recompute database indexes

    $ npm run setup

##### 5. Start process

Only after `setup` finalizes (it may take few minutes) we start the process again with `pm2 start {app-name}`, again on example of `els`:

    $ pm2 start els
