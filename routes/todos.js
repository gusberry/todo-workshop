var express = require('express');
var router = express.Router({ mergeParams: true });

router.get('/', function(req, res) {
  res.send('All todos' + JSON.stringify(req.params));
});

router.post('/', function(req, res) {
  res.send(`Created todo with data: $${JSON.stringify(req.body)}`);
});

router.get('/:todoId', function(req, res) {
  res.send(`todo id: ${req.params.todoId}`);
});

router.put('/:todoId', function(req, res) {
  res.send(`Updated todo id: ${req.params.todoId} with data: ${JSON.stringify(req.body)}`);
});

router.delete('/:todoId', function(req, res) {
  res.send(`Removed todo id: ${req.params.todoId}`);
});

module.exports = router;
