var express = require('express');
var router = express.Router();
const User = require('../models/user');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function (req, res, next) {
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
  const valid = await user.checkPassword(req.body.password);
  if (valid) {
    const accessToken = jwt.sign(
      { id: user._id },
      '7b2d8cdf78308edd2dcaf67c101f3dfd3ecf7b43e4fbba8ab7abe564771dde9b34988947c26b9479365b291ba6608349b97a9b21fc200faf038845d9b09fcb29',
      { expiresIn: '7d' }
    );
    return res.status(200).send(accessToken);
  }
  else {
    return res.status(400).send('email or password are incorrect');
  }

});

module.exports = router;
