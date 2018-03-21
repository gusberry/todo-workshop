# NODE - from 0 to TODO app

## In this step we will learn

- how to add/modify routes
- the basic structure of standard APIs

***Alright let's adapt server to our needs!***

Now we have only two main routes:

- `/` - sends the index.html to the client
- `/users` - just a stub right now

Our goal is:

- `/` - sends the index.html to the client
- `/lists` - we would hold several lists for our todos
- `/todos` - will be responsible for todos data

So first thing we need to do is to change `/users` route to let's say `/todos`. Go to **app.js** file and change:

```js
app.use('/users', usersRouter);
```

to

```js
app.use('/todos', todosRouter);
```

as well as naming of a file from `routes/users.js` to `routes/todos.js` and variables.

Open your todos router file and let's add some more routes there. Let`s assume that we would need to get all todos and have some standard CRUD operations.

In order to make that we would need to add some more handlers to our **todos** router.

```js
// routes/todos.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('All todos');
});

router.post('/', function(req, res) {
  res.send(`Created todo with data: $${JSON.stringify(req.body)}`);
});

router.get('/:todoId', function(req, res) {
  res.send(`Todo id: ${req.params.todoId}`);
});

router.put('/:todoId', function(req, res) {
  res.send(`Updated todo id: ${req.params.todoId} with data: ${JSON.stringify(req.body)}`);
});

router.delete('/:todoId', function(req, res) {
  res.send(`Removed todo id: ${req.params.todoId}`);
});

module.exports = router;
```

Go ahead and restart your server and try your new API endpoint <http://localhost:3000/todos>!

As we have a todos router now let's add another router for our lists. Create a new file in **/routes** folder - **lists.js**. For now just copy/paste the content from **todos.js** and change like all namings to *lists* instead of *todos*. After that we would need to create a separate route for our **lists**. This can be done in `/app.js`. Add this line to your code:

```js
app.use('/', indexRouter);
app.use('/todos', todosRouter);
app.use('/lists', listsRouter); // <- new line
```

And don't forget to require our listsRouter.
Ok restart the server and test your new route <http://localhost:3000/lists>!

Ok so there is one thing left in order to finish our REST api structure. We need to get the full URL `/lists/1/todos...` working. In order to do that let's reuse our **todos** router in **lists**.

Create a new route handler for `/todos` in `routes/lists.js`

```js
var todosRouter = require('./todos.js')
...

router.use('lists/:listId/todos', todosRouter);
```

Restart the server in you should be able to access the full resource route <http://localhost:3000/lists/1/todos/2>

Perfect! We have our API sceleton in place it's time to add some storage.

If you ready to go to the next step run:

```sh
git clean -fd
git checkout step-3-DB
```

[official site]: <http://expressjs.com>