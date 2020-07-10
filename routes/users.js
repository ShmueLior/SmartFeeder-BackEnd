var express = require('express');
var router = express.Router();
const User = require('../models/user');
var jwt = require('jsonwebtoken');
const passport = require('passport');


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
    return res.status(401).send('The user does not exist in the system');
  } else {
    const valid = await user.checkPassword(req.body.password);
    if (valid) {
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      let respo = {
        token: accessToken,
        email: user.email,
        username: user.username,
        phone: user.phone
      }
      return res.status(200).send(respo);
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


//-----------------For Arduino only!--------------------
router.get('/:id', async  function (req, res, next) {
  const userId = req.params.id;
  const user = await User.findById(userId).lean();  
  return res.end(JSON.stringify(user.flags));

});

//-----------------For Arduino only!--------------------
router.post('/:id/:flag', async  function (req, res, next) {
  const userId = req.params.id;
  const flag = req.params.flag;

  try {
    const filter = { _id: userId };
    let user = await User.findOne(filter);
    user.flags.set(flag, false);
    await user.save();
    res.status(200).send("drop food flag is down!");
} catch (err) {
    res.status(400).send(err.message);
}

});




module.exports = router;