const express = require("express");
const { ensureLoggedIn } = require("connect-ensure-login");

const todoController = require("../controllers/todo");
const listController = require("../controllers/list");

const router = express.Router();

router.use(ensureLoggedIn("/login"));

router.get("/", function(req, res) {
  listController
    .getListsTodos(req.context.list)
    .then(todos => res.send(todos))
    .catch(next);
});

router.post("/", function(req, res, next) {
  todoController
    .createTodoAndAddToList(req.context.list, req.body)
    .then(todo => res.json(todo))
    .catch(next);
});

router.param("todoId", function(req, res, next, todoId) {
  todoController
    .getTodoById({ id: todoId })
    .then(todo => {
      req.context = req.context || {};
      req.context.todo = todo;

      next();

      return todo;
    })
    .catch(next);
});

router.get("/:todoId", function(req, res, next) {
  res.json(req.context.todo);
});

router.put("/:todoId", function(req, res, next) {
  todoController
    .updateTodo(req.context.todo, req.body)
    .then(todo => res.json(todo))
    .catch(next);
});

router.delete("/:todoId", function(req, res, next) {
  todoController
    .deleteTodo(req.context.todo)
    .then(todo => res.json(todo))
    .catch(next);
});

module.exports = router;
