Node Slack Clone
=======================

Node / Express application with support for 
* Users (CRUD)
* Groups (CRUD)
* Messages in groups


Requirements
============

* Node >= 8.x

Installation
============

    npm install

Configuration
=====

| Variable | Default | Description |
| ------ | ------ | ------ |
| PORT | 3000 |The port on which to listen for requests. |
| MONGODB_URI | mongodb://localhost:27017/test | The URI to connect to mongodb. Include username and password in this. |
| ALLOW_ORIGIN | * | Determines from which URl requests are allowed (CORS). |
| SECRET | somesecret | The secret to use for signing the JWT token. |
| JWT_EXPIRES | 1d | Determines the expiry of the JWT token. Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms).|

Usage 
=======
    $ npm run

    build - Builds the project,
    start - Builds and starts the project
    start.dev - Builds and starts the projects. Also monitors the src folder for changes and restarts on change.
    start.prod - Builds and starts the projects with NODE_ENV set to production.
    test - Builds and runs the tests.

Running Locally
=======
Make sure you have Node.js installed.

    npm install
    npm start
    
Your app should now be running on localhost:3000.
