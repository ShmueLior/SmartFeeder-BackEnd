var express = require('express');
var router = express.Router();
const Dog = require('../models/dog');
const User = require('../models/user');
const passport = require('passport');

/*POST /api/v1.0/dogs/new */
router.post('/new', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let dog = new Dog(req.body);
    dog.ownerID = req.user._id;
    try {
        await dog.save();
        res.status(201).send('Created');
    } catch (err) {
        res.status(400).send(err.message);
        next();
    }
});

/*POST /api/v1.0/dogs/dropfood */
router.post('/dropfood', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const filter = { _id: req.user._id };
        let user = await User.findOne(filter);
        user.flags.set('dropFood', true);
        await user.save();
        res.status(200).send("flag up");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;