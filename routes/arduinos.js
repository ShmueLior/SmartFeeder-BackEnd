var express = require("express");
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Arduino = require('../models/arduino');


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
            res.status(200);
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;