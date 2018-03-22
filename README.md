# NODE - from 0 to TODO app

## In this step we will learn

- how to use **sequelize-cli**
- how to **connect** to your **DB**
- how to **create tables and relations** programmatically
- basic architecture in express app

### Sequelize

What is **sequelize**?

>Sequelize is a promise-based ORM for Node.js v4 and up. It supports the dialects PostgreSQL, MySQL, SQLite and MSSQL and features solid transaction support, relations, read replication and more.

To make our life easier let's use **sequelize-cli** to generate our DB connection logic.

```sh
npm install --save sequelize pg pg-hstore # we will use PostgreSQL for this tutorial but you can use any from supported one
npm install --save-dev sequelize-cli
```

From that point we can use **sequelize** to generate files for us

```sh
node_modules/.bin/sequelize init
```

Let's take a look at our new files

```sh
├── bin
├── routes
├── public
├── config # new
│   └── config.json
├── models # new
│   └── index.js
├── migrations # new
├── seeders # new
├── README.md
├── package.json
├── .gitignore
└── app.js

```
- `config/config.json` is holding your configurations to connect to DB for different envs
- `models/index.js` is needed to initialize models that will be defined within `models/` folder. It is also exports *db* object to be accessed from other places
- `migrations` will contain migration instructions for transferring our DB from one state to another
- `seeders` will contain data in order to prepopulate our DB.

For now our DB logic is not connected to our server and DB connection is not established. What we have to do right now is change our development config with connection instructions to our DB.

```json
{
  "development": {
    "username": "%your username to DB%",
    "password": "%your password to DB%",
    "database": "%DB name%",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
 ...
}
```

After that we had to establish connection to DB. And the best place to do that is before starting the server as there will be any issues with DB the server will be useless.
Ok let's add connection logic to our `bin/www` file.

```js
// bin/www

var app = require('../app');
var db = require('../models');
...
/**
 * Listen on provided port, on all network interfaces.
 */

db.sequelize
  .sync()
  .then(() => {
    console.log("Connection has been established successfully.");
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });
```

Now you can start the server. You should see something like this in your terminal

```sh

```

If you ready to go to the next step run:

```sh
git clean -fd
git checkout step-3-DB
```

[official site]: <http://expressjs.com>