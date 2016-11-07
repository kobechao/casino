const express = require('express');
const bodyParser = require('body-parser')
const monk = require('monk');
const jwt    = require('jsonwebtoken');
const config = require('./config');
const app = express();

const port = process.env.PORT || 8080;
app.set('superSecret', config.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = monk(config.database);


app.use((req,res,next) => {
      req.db = db;
      next();
});


app.get('/users', (req, res, next) => {
      var usersDB = db.get('users');
    // usersDB.find({},{},function(e,docs){
    //   console.log(e)
    //       });

  usersDB.find({}).then((docs) => {
      // only the name field will be selected
              res.json(docs);
    })


});

app.listen(port, () => {
  console.log('listen on ' + port);
} );

