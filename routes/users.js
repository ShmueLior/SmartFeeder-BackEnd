var express = require('express');
var router = express.Router();
const User = require('../models/user');
var jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send('Unathorized!');
    // res.send('unathorized token');
  }
}


/* GET users listing. */
router.get('/authorized_request', verifyToken, function (req, res, next) {
  jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
    if (err) {
      res.status(403).send('authorization error');
    }
    else {
      res.json({
        message: 'authorized',
        authData
      })
    }
  });
  res.send('respond with a resource');
});

/*POST /api/v1.0/users/signup */
router.post('/signup', async function (req, res, next) {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send('Created');
  } catch (err) {
    res.status(400).send(err.message);
    next();
  }
});

/*POST /api/v1.0/users/login */
router.post('/login', async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (user === null) {
    return res.status(401).send('invalid email');
  } else {
    const valid = await user.checkPassword(req.body.password);
    if (valid) {
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).send(accessToken);
    }
    else {
      return res.status(401).send('invalid password');
    }
  }

});

/*DELETE /api/v1.0/users/:email */
router.delete('/:email', function (req, res, next) {
  User.findOneAndRemove({ email: req.params.email }).exec().then(doc => {
    if (!doc) { return res.status(404).end(); }
    return res.status(204).end();
  })
    .catch(err => next(err));

});

/*GET /api/v1.0/users */
router.get('/', function (req, res, next) {
  User.find({}, function (err, users) {
    if (err) {
      return res.status(400).send(err.message);
    } else {
      return res.status(200).send(users);
    }
  })
});

module.exports = router;