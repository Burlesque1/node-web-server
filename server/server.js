require('./config/config')
const _ = require('lodash')
var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();

const port = process.env.PORT

// get text from request
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({ // todo has already connected to Mongodb
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
    // console.log(doc);
  }, (e) => {
    res.status(400).send(e);
    console.log(JSON.stringify(e))
  });

});

app.get('/todos', (req, res) => {
  Todo.find().then((results) => {
    res.send({results}); // send object more flexible
  }, (e) => {
    res.status(400).send(e);
  })
})

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  Todo.findById(id).then((todos) => {
    if(!todos){
      return res.status(404).send();
    }
    res.send({todos});
  }, (e) => res.status(400).send());
})

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todos) => {
    if (!todos) {
      return res.status(404).send();
    }

    res.send({todos});
  }).catch((e) => {
    res.status(400).send();
  });
});

// update operation
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then((user) => {
    res.send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};