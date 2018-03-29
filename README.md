# NODE - from 0 to TODO app

## In this step we will learn

- what is **express**
- how to use **express-generator**
- basic principles of **express applications**

## Express

The easiest way to explain what is **express** is to get definition from [official site]

> Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

This frameworks helps to hide all low level nodejs apis and gives developer a more userfriendly interfaces to work with requests.

In order to start developing our application we need to install **express-generator** that will do most of the handwork. This command will add `express` command to your **PATH** so it will be available in the terminal.

```sh
npm install -g express-generator
```

After that we can generate our app. To make our app simpler we won't use any template engines (`--no-view` flag).

```sh
express --no-view
```

You should now have some new files in your project (the structure is not strict and can be changed to fit your application purposes).

```sh
├── bin
│   └── www
├── routes
│   ├── users.js
│   └── index.js
├── public
│   └── ...
├── README.md
├── package.json
└── app.js
```

- `package.json` - is the place to list your app dependencies, commands, configs for your packages etc.
- `app.js` - is used for configuring your server, this is the place where the initial routing is made and a common request handlers are connected to your application.
- `public` - folder is used to serve files to the client
- `routes` - contains handlers for specific routes
- `bin\www` - this is the entry point for your application. Basic error handling and server launch are made here.

Ok lets start our server! Run:

```sh
npm install && npm start
```

And open browser <http://localhost:3000>

Congratulations! You are running your very first NodeJS server.

If you ready to go to the next step run:

```sh
git clean -fd
git checkout step-2-API
```

[official site]: <http://expressjs.com>