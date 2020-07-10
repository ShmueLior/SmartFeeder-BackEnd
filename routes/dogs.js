var express = require('express');
var router = express.Router();
const fs = require('fs-extra');
const Dog = require('../models/dog');
const User = require('../models/user');
const passport = require('passport');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = './uploads/';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        cb(null, path);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});

/*GET /api/v1.0/dogs */
router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const dogs = await Dog.find({ ownerID: user });
        res.status(200).send(dogs);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*POST /api/v1.0/dogs/new */
router.post('/new', passport.authenticate('jwt', { session: false }), upload.single('image'), async function (req, res, next) {
    const dog = new Dog({
        name: req.body.name,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        ownerID: req.user._id,
        image: req.file.path,
    });
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
        res.status(200);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;