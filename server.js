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

const apiRoutes = express.Router(); 

const db = monk(config.database);


app.use((req,res,next) => {
  req.db = db;
  next();
});

app.all('/',(req, res, next) => {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
	// return res.json({ success: false, message: 'Failed to authenticate token.' });    
        res.redirect('/login');
      } else {
	// if everything is good, save to request for use in other routes
	req.decoded = decoded;    
	next();
      }
    });

  } else {
    console.log("hi in false")
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  console.log("get login")
  res.sendFile(__dirname + '/public/login.html')
});

app.get('/', (req, res) => {
  // res.end("hi")
  console.log(req.decoded);
  res.sendFile(__dirname + '/public/index.html')
});
app.get('/users', (req, res, next) => {
  const usersDB = db.get('users');

  usersDB.find({}).then((docs) => {


    res.json(docs);
  })
});

app.post('/login', (req, res, next) => {
  const usersDB = db.get('users');
  const userName = req.body.name;
  const userPassword = req.body.password


  usersDB.findOne({name: userName}, {}, (e, docs) => {
    if(!docs){
      res.json({
	error:  'You are not our user yet!',
      })
    }
    else if(docs.password == userPassword){
      const token = jwt.sign(docs.name , app.get('superSecret'));
      res.json({
        userId: docs._id,
	userName: userName,
	token:  token
      })
    }
    else{
      res.json({
	error:  'password wrong!',
      })
    }
  });

});

app.listen(port, () => {
  console.log('listen on ' + port);
} );

