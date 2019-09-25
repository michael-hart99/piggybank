# Piggybank

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

Piggybank is a system created to manage data for a performing group by using
Google Sheets and Google Forms. The data managed includes transactions,
attendances, and member information. This was created for groups without
experience using a database programming language to have a system similar
to using a database that has easy shortcuts for common operations.

[![Demo video](https://i.imgur.com/BSASBoS.png)](https://youtu.be/lqzI_y59EEI)

#### Database
The database is a spreadsheet containing 8 sheets that are designed to have
no overlapping information. Any time a sheet is modified, all of the sheets
and forms that are generated from the sheet's values are refreshed.

#### Views
There is a spreadsheet of views that serves as a human-readable view of the
database. Values that are important to note are highlighted in red and other
formatting measures are employed to improve readability. This spreadsheet also
has a selection of menu options that the user can select to generate reports
on the data or modify the data.

#### Forms
There are 11 forms that exist to allow for easy manipulation of the database,
especially while using a mobile phone. Mobile phones have a much easier time
loading, displaying, and editing a form versus a sheet. These forms consist
of common actions such as taking attendance or collecting dues.

#### Backups
Every other week, the database will trigger a complete backup of all of its
sheets. These are stored in the Backups folder under timestamps and safeguard
the database in case data is accidentally lost.

## Set-up

I created this to be set up on a Linux machine, however I think it is also
compatible with Mac OS. I have never attempted setting up on Windows, but am
doubtful that it would work.

Setting up requires the following:
* [Python 3 and pip][link_python]
* [NPM][link_npm]

Fork and/or clone this repo.

Follow step 1 in [this tutorial][link_quickstart]. Be sure to download the
`credentials.json` file, move it to the repository's directory.

<p align="center">
 <img alt="Enable Drive API" src="https://i.imgur.com/wLkAPLc.png" title="Enable Drive API">
 <img alt="Enable Drive API" src="https://i.imgur.com/bumBvCI.png" title="Enable Drive API">
 <img alt="Enable Drive API" src="https://i.imgur.com/5OaPeHX.png" title="Enable Drive API">
</p>

Go to [this settings page](https://script.google.com/u/3/home/usersettings) for Google Scripts to enable Google Apps Script API.

<p align="center">
 <img alt="Enable GAS API" src="https://i.imgur.com/IbKyJyl.png" title="Enable GAS API">
 <img alt="Enable GAS API" src="https://i.imgur.com/e1Kyivi.png" title="Enable GAS API">
</p>

Wait 10 minuntes to ensure that the API permissions are fully enabled.

Install the python library for accessing Google's Drive API by running

```
pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

Now run

```
npm run setup
```

This will prompt you for information about your group and ask for google drive
authorization twice. One will be to authorize the project to create drive files
and edit the files it has created, the other will be to authorize the project
to run scripts to fully manage files within your Google Drive using Google
Script.

The Google Script project should open after everything has been initialized.
Switch tabs to `unwrapBundle.gs`, select function `initialize`, then run it.
This will bring up an authorization dialog, give the script authorization so
that it can create automatic triggers and edit the sheets and forms as
necessary.

<p align="center">
 <img alt="Google Script Initialize" src="https://i.imgur.com/abvXAtj.png" title="Google Script Initialize">
 <img alt="Google Script Initialize" src="https://i.imgur.com/QRIsqM6.png" title="Google Script Initialize">
 <img alt="Google Script Initialize" src="https://i.imgur.com/ymBs31y.png" title="Google Script Initialize">
 <img alt="Google Script Authorize" src="https://i.imgur.com/k46o0Cy.png" title="Google Script Authorize">
 <img alt="Google Script Authorize" src="https://i.imgur.com/d4dfVzO.png" title="Google Script Authorize">
 <img alt="Google Script Authorize" src="https://i.imgur.com/ltqBg98.png" title="Google Script Authorize">
 <img alt="Google Script Authorize" src="https://i.imgur.com/xlaoQ7G.png" title="Google Script Authorize">
</p>

Now your Google Drive files are all set up.

## Deploying Customizations

<p align="center">
 <img alt="Code Preview" src="https://i.imgur.com/YQkQ6Ex.png" title="Code Preview">
</p>

If you'd like to customize the code, please feel free! The code was designed
be as readable as possible while working smoothly with Google Apps Script. Some
things to note:

* If you want a method to be visible to GAS, you must include it in
`./dev/main.ts` as well as `./build/unwrapBundle.js`. That applies to triggers,
menu functions, and menu action handlers.
* The RefreshLogger class is designed to track database sheets that have
updated and then refresh all of the dependent forms and sheets at once after
all operations have finished.
* It is difficult to debug errors in the code because the code runs after being
compiled into a 5000+ line file. However, you can add debug lines to the code
hosted on https://script.google.com and view all of the recent executions at
https://script.google.com/home/executions.
* Menu action handlers(since they are web app executions) can only be passed
strings as arguments. If you do not do this, you will get an error similar to
`TypeError: Failed due to illegal value in property: 0`.

When you are ready to deploy your code, run
```
npm run deploy
```

This will compile the Typescript, bundle the files together, then push to
Google Scripts.

## Built With

* [Google Apps Script][link_gas] - Used to create triggers and update Google Files
* [Google CLASP][link_clasp] - Used to deploy code to Google Scripts
* [NPM][link_npm] - Used to manage dependencies and run custom scripts
* [Typescript][link_typescript] - Javascript with compilation checking
* [WebPack][link_webpack] - Used to package TypeScript into JavaScript

## Acknowledgments

I think it's important to mention
[Ferreira's Google Apps Script][link_ferreira] for helping me solve some truly
strange quirks about the GAS system.

[link_gas]: https://developers.google.com/apps-script/
[link_clasp]: https://github.com/google/clasp
[link_npm]: https://www.npmjs.com/
[link_typescript]: https://github.com/microsoft/TypeScript
[link_webpack]: https://webpack.js.org/

[link_quickstart]: https://developers.google.com/drive/api/v3/quickstart/python
[link_python]: https://www.python.org/downloads/release/python-374/
[link_npm]: https://www.npmjs.com/get-npm

[link_ferreira]: https://the-eye.eu/public/Books/IT%20Various/OReilly%20Google%20Apps%20Script%2C%20Web%20Application%20Development%20Essentials%202nd%20%282014%29.pdf
