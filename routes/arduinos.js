var express = require("express");
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Arduino = require('../models/arduino');
const Dog = require('../models/dog');
var createError = require('http-errors');


/*GET /api/v1.0/arduinos */
router.get('/', function (req, res, next) {
    res.status(200).send({ message: "Yafe" });
});

/*POST /api/v1.0/arduinos/new */
router.post('/new', async function (req, res, next) {
    try {
        const arduino = new Arduino({
            arduinoId: req.body.arduinoId,
        });

        await arduino.save();
        res.status(201).send(arduino);
    } catch (err) {
        res.status(400).send(err.message);
        next();
    }
});

/*GET /api/v1.0/arduinos/:arduinoId */
router.get('/:arduinoId', async function (req, res, next) {
    const arduinoIdReq = req.params.arduinoId;
    try {
        const arduino = await Arduino.findOne({ arduinoId: arduinoIdReq });
        if (arduino == null) {
            res.status(404).send({ message: "arduino ID not found" });
        }
        else {
            res.status(200).send({ message: "Success!" });
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/*GET /api/v1.0/arduinos/:arduinoId/flags */
router.get('/:arduinoId/flags', async function (req, res, next) {
    const arduinoId = req.params.arduinoId;
    let dog = await Dog.findOne({ espSerialNumber: arduinoId });
    if (dog == null) {
        return res.status(404).send({ message: "No dog is registered for this device" });
    }
    return res.end(JSON.stringify(dog.flags));
});

/*POST /api/v1.0/arduinos/:arduinoId/:flag*/
router.post('/:arduinoId/:flag', async function (req, res, next) {
    const arduinoId = req.params.arduinoId;
    const flag = req.params.flag;
    try {
        const dog = await Dog.findOne({ espSerialNumber: arduinoId });
        if (dog == null) {
            return res.status(404).send({ message: "No dog is registered for this device" });
        }

        dog.flags.set(flag, false);
        await dog.save();
        res.status(200).send(`${flag} flag is down!`);
    } catch (err) {
        res.status(400).send(err.message);
    }

});

module.exports = router;