
# Project Title

Exercise: Building a Customer Module with Node.js

---
## Requirements

The aim of this exercise is to develop a customer module for a web application using
Node.js, Express.js. The module should cover CRUD (Create, Read, Update, Delete)
operations on customer records, profile image upload, password hashing, input
validation, authentication using JWT (JSON Web Tokens), ORM usage with Sequelize /
Mongoose, and error handling.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v21.7.3

    $ npm --version
    10.5.0

###
### Yarn installation
  After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Install

    $ gh repo clone priyankpatel-dev/node_exam
    $ cd node_exam
    $ npm install

## Configure app

Open `config.env` then edit it with your settings. You will need:

- MongDB Connection;

## Running the project as development

    $ npm start

## Running for production

    $ npm start:prod