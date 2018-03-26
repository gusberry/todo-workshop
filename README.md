# NODE - from 0 to TODO app

## In this step we will learn

- how to connect your DB to API

Ok we have our routing and DB up and running. But now we had to connect those entities.

First of all lets create interfaces to our models. That will make our application a little more flexible and let us change in future the way we are manipulating our data in application. Let's create interface fot a List model.

```js
const db = require("../models");

module.exports = {
  get: ({ id }) => db.List.findById(id),

  create: ({ title }) => db.List.create({ title }),

  delete: ({ id }) => db.List.destroy({ where: { id } }),

  update: ({ id, title }) =>
    db.List.update({ title }, { where: { id }, returning: true }).then(
      res => res[1][0]
    ),

  getAllTasks: ({ id }) => db.List.findById(id).then(list => list.getTodos())
};
```

Now when we have interface for our **List model** let's do the same for our **Todo model**

```js
const db = require("../models");
const listInterface = require("./list");

module.exports = {
  get: ({ id }) => db.Todo.findById(id),

  create: ({ text }) => db.Todo.create({ text }),

  delete: ({ id }) => db.Todo.destroy({ where: { id }, returning: true }),

  update: ({ id, text, done, removed }) =>
    db.Todo.update(
      { text, done, removed },
      { where: { id }, returning: true }
    ).then(res => res[1][0]),

  createAndAddToList: ({ listId, text }) =>
    Promise.all([
      module.exports.create({ text }),
      listInterface.get({ id: listId })
    ]).then(([todo, list]) => todo.setList(list))
  // or you can just use db.Todo.create({ text, ListId: listId })
};
```

Probably you've noticed `.getTodos()` and `.setList()` methods. Those methods are added by sequelize with defining associations on model initialization.

Now when we've hidden our DB related implementation in interface logic we can continue with routers controllers. They will be used to perform a proper handling of request data.

```js
// controllers/list.js
const listInterface = require("../interfaces/list");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getListById: ({ id }) => {
    validate({ id });

    return listInterface.get({ id });
  },

  createList: ({ title }) => {
    validate({ title });

    return listInterface.create({ title });
  },

  updateList: ({ id, title }) => {
    validate({ id, title });

    return listInterface.update({ id, title });
  },

  deleteList: ({ id }) => {
    validate({ id });

    return listInterface.delete({ id });
  },

  addTodoToList: ({ id, todoText }) => {
    validate({ id, todoText });

    return listInterface.addTask({ id, todoText });
  },

  getListsTodos: ({ id }) => {
    validate({ id });

    return listInterface.getAllTasks({ id });
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

  updateTodo: ({ id, text, done, removed }) => {
    validate({ id, text, done, removed });

    return todoInterface.update({ id, text, done, removed });
  },

  deleteTodo: ({ id }) => {
    validate({ id });

    return todoInterface.delete({ id });
  },

  createTodoAndAddToList: ({ listId, text }) => {
    validate({ listId, text });

    return todoInterface.createAndAddToList({ listId, text });
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

router.get("/:listId", function(req, res) {
  listController
    .getListById({ ...req.body, id: req.params.listId })
    .then(list => res.send(list));
});

router.put("/:listId", function(req, res) {
  listController
    .updateList({ ...req.body, id: req.params.listId })
    .then(list => res.send(list));
});

router.delete("/:listId", function(req, res) {
  listController
    .deleteList({ id: req.params.listId })
    .then(list => res.send(list));
});

router.use("/:listId/todos", todosRouter);
...
```

```js
// routes/todos.js
...
router.get("/", function(req, res) {
  listController
    .getListsTodos({ id: req.params.listId })
    .then(todos => res.send(todos));
});

router.post("/", function(req, res) {
  todoController
    .createTodoAndAddToList({ ...req.body, listId: req.params.listId })
    .then(todo => res.json(todo));
});

router.get("/:todoId", function(req, res) {
  todoController
    .getTodoById({ id: req.params.todoId })
    .then(todo => res.json(res));
});

router.put("/:todoId", function(req, res) {
  todoController
    .updateTodo({ id: req.params.todoId, ...req.body })
    .then(todo => res.json(res));
});

router.delete("/:todoId", function(req, res) {
  todoController
    .deleteTodo({ id: req.params.todoId })
    .then(todo => res.json(todo));
});
...
```

Done! If you'll restart the server you should be able to perform CRUD operations on todos and lists resources. There is still no error handling and validation but this is a topic for another step.

## Architecture overview

If you step back and try to look on our app from architecture stand point you should see that we are using layered approach. App, routes, controllers, interfaces, models are all serving only one purpose. Single source of responsibility approach helps to keep our app more maintainable and more clear. Another thing that you can probably see is that our data flow is never jumps back and always goes `user > route > controller > interface > model > route > user`. This helps to prevent any side effects to our data and increases maintainability and testability to our code. All this stuff us more easily to extend and change our application in future. For example we can store our tasks in let's say external service in this case the only thing we need to change is the interface logic of todos and the rest of application will be the same. You'll see how it's easy to extend our app in future steps when we will switch our RESTful API to GraphQL.

If you ready to go to the next step run:

```sh
git clean -fd
git checkout step-3-DB
```