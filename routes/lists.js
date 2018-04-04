const express = require("express");
const { ensureLoggedIn } = require("connect-ensure-login");

const todosRouter = require("./todos");
const listController = require("../controllers/list");

const router = express.Router();

router.use(ensureLoggedIn("/login"));

router.get("/", function(req, res) {
  res.send("All lists");
});

router.post("/", function(req, res, next) {
  listController
    .createList(req.body, req.user)
    .then(list => res.send(list))
    .catch(next);
});

router.param("listId", function(req, res, next, listId) {
  listController
    .getListById({ id: listId })
    .then(list => {
      req.context = req.context || {};
      req.context.list = list;

      next();

      return list;
    })
    .catch(next);
});

router.get("/:listId", function(req, res, next) {
  res.json(req.context.list);
});

router.put("/:listId", function(req, res, next) {
  listController
    .updateList(req.context.list, req.body)
    .then(list => res.json(list))
    .catch(next);
});

router.delete("/:listId", function(req, res, next) {
  listController
    .deleteList(req.context.list)
    .then(list => res.json(list))
    .catch(next);
});

router.use("/:listId/todos", todosRouter);

module.exports = router;
