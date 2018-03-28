const express = require("express");

const todosRouter = require("./todos");
const listController = require("../controllers/list");

const router = express.Router();

router.get("/", function(req, res) {
  res.send("All lists");
});

router.post("/", function(req, res) {
  listController.createList(req.body).then(list => res.send(list));
});

router.param("listId", function(req, res, next, listId) {
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

module.exports = router;
