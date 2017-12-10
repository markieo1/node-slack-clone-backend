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

| Variable | Value |
| ------ | ------ |
| PORT | The port on which to listen for requests. |
| MONGODB_URI | The URI to connect to mongodb. Include username and password in this. |
| ALLOW_ORIGIN | Determines from which URl requests are allowed (CORS). |
| SECRET | The secret to use for signing the JWT token. |
| JWT_EXPIRES | Determines the expiry of the JWT token. Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms).|

Credits
=======

* [Marco Havermans](https://github.com/markieo1/) for creating this application
