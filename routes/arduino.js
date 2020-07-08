var express = require("express");
var router = express.Router();

/*GET /api/v1.0/arduino */
router.get('/', function (req, res, next) {
    res.status(200).send("This will be an array of flag jast for you!");
});

module.exports = router;