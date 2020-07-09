var express = require('express');
var router = express.Router();
const User = require('../models/user');
var jwt = require('jsonwebtoken');


function verifyToken(req, res,next){
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  }else{
    res.status(403).send('Unathorized!');
    // res.send('unathorized token');
  }
}


/* GET users listing. */

// template of the rest request
router.get('/authorized_request', verifyToken, function (req, res, next) {
  jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData)=> {
    if (err){
      res.status(403).send('authorization error');
    }
    else{
      // request authorized
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


module.exports = router;