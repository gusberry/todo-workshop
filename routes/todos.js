const express = require("express");
const { ensureLoggedIn } = require("connect-ensure-login");

const todoController = require("../controllers/todo");
const listController = require("../controllers/list");

const router = express.Router();

router.use(ensureLoggedIn("/login"));

router.get("/", function(req, res) {
  listController.getListsTodos(req.context.list).then(todos => res.send(todos));
});

router.post("/", function(req, res) {
  todoController
    .createTodoAndAddToList(req.context.list, req.body)
    .then(todo => res.json(todo));
});

router.param("todoId", function(req, res, next, todoId) {
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

module.exports = router;
