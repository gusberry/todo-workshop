# NODE - from 0 to TODO app

## In this step we will learn

- how to connect your DB to API

Ok we have our routing and DB up and running. But now we had to connect those entities.

First of all lets create interfaces to our models. That will make our application a little more flexible and let us change in future the way we are manipulating our data in application. Let's create interface fot a List model.

```js
// interfaces/list.js
const db = require("../models");

module.exports = {
  get: ({ id }) => db.List.findById(id),

  create: ({ title }) => db.List.create({ title }),

  delete: list => list.destroy(),

  update: (list, { title }) => list.update({ title }),

  getAllTasks: list => list.getTodos()
};
```

Now when we have interface for our **List model** let's do the same for our **Todo model**

```js
// interfaces/todo.js
const db = require("../models");
const listInterface = require("./list");

module.exports = {
  get: ({ id }) => db.Todo.findById(id),
  
  create: ({ text }) => db.Todo.create({ text }),

  delete: todo => todo.destroy(),

  update: (todo, { text, done, removed }) =>
    todo.update({ text, done, removed }),

  createAndAddToList: (list, { text }) =>
    module.exports.create({ text }).then(todo => todo.setList(list))
};
```

Probably you've noticed `.getTodos()` and `.setList()` methods. Those methods are added by sequelize with defining associations on model initialization.

Now since we've hidden our DB related implementation in interface logic we can continue with routers controllers. They will be used to perform a proper handling of request data.

```js
// controllers/list.js
const todoInterface = require("../interfaces/todo");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getTodoById: ({ id }) => {
    validate({ id });
    return todoInterface.get({ id });
  },

  createTodo: ({ text }) => {
    validate({ text });
    return todoInterface.create({ text });
  },

  updateTodo: (todo, newData) => {
    validate(todo, newData);
    return todoInterface.update(todo, newData);
  },

  deleteTodo: todo => {
    validate(todo);
    return todoInterface.delete(todo);
  },

  createTodoAndAddToList: (list, todoData) => {
    validate(list, todoData);
    return todoInterface.createAndAddToList(list, todoData);
  }
};
```

and for Todos

```js
const todoInterface = require("../interfaces/todo");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getTodoById: ({ id }) => {
    validate({ id });
    return todoInterface.get({ id });
  },

  createTodo: ({ text }) => {
    validate({ text });
    return todoInterface.create({ text });
  },

  updateTodo: (todo, newData) => {
    validate(todo, newData);
    return todoInterface.update(todo, newData);
  },

  deleteTodo: todo => {
    validate(todo);
    return todoInterface.delete(todo);
  },

  createTodoAndAddToList: (list, todoData) => {
    validate(list, todoData);
    return todoInterface.createAndAddToList(list, todoData);
  }
};
```

As you can see **validate** function does nothing right now but this will be covered in a block related to **Error handling in Node/Express App**

Ok so there is one little step left in order to get our API up and running - use our controllers in routers. Naming of controllers methods can easily tell you were they can be used within router endpoints.

```js
// routes/lists.js
...
router.get("/", function(req, res) {
  res.send("All lists");
});

router.post("/", function(req, res) {
  listController.createList(req.body).then(list => res.send(list));
});

router.param(":listId", function(req, res, next, listId) {
  listController.getListById({ id: listId }).then(list => {
    req.context = req.context || {};
    req.context.list = list;

    next();

    return list;
  });
});

router.get("/:listId", function(req, res) {
  res.json(req.context.list);
});

router.put("/:listId", function(req, res) {
  listController
    .updateList(req.context.list, req.body)
    .then(list => res.json(list));
});

router.delete("/:listId", function(req, res) {
  listController.deleteList(req.context.list).then(list => res.json(list));
});

router.use("/:listId/todos", todosRouter);
```

Take a look at `router.param` method. Every time a route with `:listId` will be hit, we will set list entity with required ID in a request context. In this way List entity will be available during request handling. Let's do the same for **todos** router.

```js
// routes/todos.js
...
router.get("/", function(req, res) {
  listController.getListsTodos(req.context.list).then(todos => res.send(todos));
});

router.post("/", function(req, res) {
  todoController
    .createTodoAndAddToList(req.context.list, req.body)
    .then(todo => res.json(todo));
});

router.param(":todoId", function(req, res, next, todoId) {
  todoController.getTodoById({ id: todoId }).then(todo => {
    req.context = req.context || {};
    req.context.todo = todo;

    next();

    return todo;
  });
});

router.get("/:todoId", function(req, res) {
  res.json(req.context.todo);
});

router.put("/:todoId", function(req, res) {
  todoController
    .updateTodo(req.context.todo, req.body)
    .then(todo => res.json(todo));
});

router.delete("/:todoId", function(req, res) {
  todoController.deleteTodo(req.context.todo).then(todo => res.json(todo));
});
...
```

As you can see we are using **list** entity from previous router to get our *todos*, quite handy yeah? You'll see additional profit when we'll create auth logic.

Done! If you'll restart the server you should be able to perform CRUD operations on todos and lists resources. There is still no error handling and validation but this is a topic for another step.

## Architecture overview

If you step back and try to look on our app from architecture stand point you should see that we are using layered approach. App, routes, controllers, interfaces, models are all serving only one purpose. Single source of responsibility approach helps to keep our app more maintainable and more clear. Another thing that you can probably see is that our data flow is never jumps back and always goes `user > route > controller > interface > model > route > user`. This helps to prevent any side effects to our data and increases maintainability and testability to our code. All this stuff helps us to extend and change our application in future more easily. For example we can store our tasks in let's say external service in this case the only thing we need to change is the interface logic of todos and the rest of application will be the same. You'll see how it's easy to extend our app in future steps when we will switch our RESTful API to GraphQL.

If you ready to go to the next step run:

```sh
git clean -fd
git checkout step-5-auth
```