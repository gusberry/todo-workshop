var express = require('express');
var todosRouter = require('./todos');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('All lists');
});

router.post('/', function(req, res, next) {
  res.send(`Created list with data: $${JSON.stringify(req.body)}`);
});

router.get('/:listId', function(req, res, next) {
  res.send(`List id: ${req.params.id}`);
});

router.put('/:listId', function(req, res, next) {
  res.send(`Updated list id: ${req.params.id} with data: ${JSON.stringify(req.body)}`);
});

router.delete('/:listId', function(req, res, next) {
  res.send(`Removed list id: ${JSON.stringify(req.params)}`);
});

router.use('/:listId/todos', todosRouter);

module.exports = router;
