var express = require('express');
var router = express.Router();
const fs = require('fs-extra');
const Dog = require('../models/dog');
const User = require('../models/user');
const passport = require('passport');
const multer = require('multer');
const { use } = require('passport');
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

    try {
        const dog = new Dog({
            name: req.body.name,
            gender: req.body.gender,
            birthDate: req.body.birthDate,
            ownerID: req.user._id,
            image: (req.file && req.file.path) ? req.file.path : undefined,
            breed: req.body.breed,
            espSerialNumber: req.body.espSerialNumber,
            gramPerMeal: req.body.gramPerMeal ? req.body.gramPerMeal : 200,
        });

        await dog.save();
        res.status(201).send(dog);
    } catch (err) {
        res.status(400).send(err.message);
        next();
    }
});

/*DELETE /api/v1.0/dogs/:id */
router.delete('/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    Dog.findOneAndRemove({ _id: req.params.id }).exec().then(doc => {
        if (!doc) { return res.status(404).end(); }
        return res.status(204).end();
    })
        .catch(err => next(err));
});

/*PUT /api/v1.0/dogs/update/:id */
router.put('/update/:id', passport.authenticate('jwt', { session: false }), upload.single('image'), async function (req, res, next) {
    try {
        const update = req.body;
        if (req.file && req.file.path) {
            update.image = req.file.path
        }
        const filter = { _id: req.params.id };
        let dog = await Dog.findOneAndUpdate(filter, update, { new: true });
        res.status(200).send(dog);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*POST /api/v1.0/dogs/dropfood/:id */
router.post('/dropfood/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        let dog = await Dog.findOne({ _id: req.params.id });
        if (dog == undefined || dog.ownerID != user.id) {
            throw new Error('Dog ID not found')
        }
        dog.flags.set('dropFood', true);
        dog.howManyDropFoodToDay += dog.gramPerMeal;
        await dog.save();
        res.status(200).send("dropfood flag up");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*POST /api/v1.0/dogs/makenoise/:id */
router.post('/makenoise/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        let dog = await Dog.findOne({ _id: req.params.id });
        if (dog == undefined || dog.ownerID != user.id) {
            throw new Error('Dog ID not found')
        }
        dog.flags.set('makeNoise', true);
        await dog.save();
        res.status(200).send("make noise flag up");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*POST /api/v1.0/dogs/containerStatus/:id */
router.post('/containerStatus/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        let dog = await Dog.findOne({ _id: req.params.id });
        if (dog == undefined || dog.ownerID != user.id) {
            throw new Error('Dog ID not found')
        }
        dog.flags.set('distance', true);
        await dog.save();
        res.status(200).send("distance flag up");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*POST /api/v1.0/dogs/newVaccine/:id */
router.post('/newVaccine/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    const dog = await Dog.findOne({ _id: req.params.id });
    if (dog === null) {
        res.status(404).send({ message: 'Dog not found in DB' });
    }
    else {
        try {
            dog.vaccines.push(req.body);
            await dog.save();
            res.status(200).send(dog.vaccines);
        } catch (err) {
            res.status(400).send({ message: err.message });
        }
    }
});

/*GET /api/v1.0/dogs/vaccines/:id */
router.get('/vaccines/:id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    const dog = await Dog.findOne({ _id: req.params.id });
    if (dog === null) {
        res.status(404).send({ message: 'Dog not found in DB' });
    }
    else {
        res.status(200).send(dog.vaccines);
    }
});

/*POST /api/v1.0/dogs/newimage/:id */
router.post('/newimage/:id', passport.authenticate('jwt', { session: false }), upload.single('image'), async function (req, res, next) {
    const filter = { _id: req.params.id };
    const update = { image: req.file.path };
    try {
        let dog = await Dog.findOneAndUpdate(filter, update, { new: true });
        if (dog === null) {
            throw new Error('Dog not found in DB');
        }
        res.status(201).send({ imagePath: dog.image });
    } catch (err) {
        res.status(400).send(err.message);
    }
});


/*POST /api/v1.0/dogs/bowlStatistic/:id/:filter */
router.get('/bowlStatistic/:id/:filter', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        let dog = await Dog.findOne({ _id: req.params.id });
        if (dog == undefined || dog.ownerID != user.id) {
            throw new Error('Dog ID not found')
        }
        let outPutArray = null;
        let counter;
        let statisticArrSize = dog.bowlStatistic.length;
        switch (req.params.filter) {
            case "day":
                counter = 1;
                break;
            case "week":
                counter = 7;
                break;
            case "month":
                counter = 30;
                break;
            case "year":
                counter = 365;
                break;

            default:
                throw new Error(`Can not parse params: ${req.params.filter} `);
                break;
        }
        outPutArray = [].fill.call({ length: counter }, null);
        for (i = statisticArrSize - 1; i >= 0 && counter > 0; i--) {
            outPutArray[--counter] = dog.bowlStatistic[i];
        }

        return res.status(200).send(outPutArray);

    } catch (err) {
        res.status(400).send(err.message);
    }
});


module.exports = router;