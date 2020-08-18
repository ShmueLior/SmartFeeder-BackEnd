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

/*POST /api/v1.0/arduinos/:arduinoId/flags */
router.post('/:arduinoId/flags', async function (req, res, next) {
    const arduinoId = req.params.arduinoId;
    let dog = await Dog.findOne({ espSerialNumber: arduinoId });
    let user = await User.findOne({ _id: dog.ownerID });
    if (dog == null) {
        return res.status(404).send({ message: "No dog is registered for this device" });
    }
    try {
        if (req.body.isContainerEmpty == true) {
            user.notifications.push(new Object({ dogInfo: dog._id, titel: "The container is about to run out", body: "Container is about to run out in 2 more days. Call the supplier to order a new Bonzo today.", date: Date.now() }));
            await user.save();
        }
        if (req.body.bowlWeight != null) {
            //save statistic
            let howMuchFoodHeAteToDay = dog.howManyDropFoodToDay - req.body.bowlWeight;
            dog.bowlStatistic.push(new Object({ date: Date.now(), howMuchHeAte: howMuchFoodHeAteToDay }));

            if (howMuchFoodHeAteToDay == 0) {
                user.notifications.push(new Object({ dogInfo: dog._id, titel: "Alert!", body: `${dog.name} did not ate today at all`, date: Date.now() }));
            }

            //enter new notification of the "sum of the day"
            user.notifications.push(new Object({ dogInfo: dog._id, titel: "Day summary", body: `${dog.name} ate: ${howMuchFoodHeAteToDay} out of ${dog.howManyDropFoodToDay} gram today`, date: Date.now() }));
            dog.howManyDropFoodToDay = 0;
            await dog.save();
            await user.save();

        }
    } catch (err) {

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