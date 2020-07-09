var express = require("express");
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');


/*GET /api/v1.0/arduino */
router.get('/', function (req, res, next) {
    res.status(200).send({ message: "Yafe" });
});

module.exports = router;