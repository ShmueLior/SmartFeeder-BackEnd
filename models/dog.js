const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
const Arduino = require('../models/arduino');
var createError = require('http-errors');

const dogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String },
    birthDate: { type: Date },
    ownerID: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    breed: { type: String },
    vaccines: [{
        name: { type: String },
        date: { type: Date },
    }],
    flags: { type: Map, of: Boolean, default: { dropFood: false, makeNoise: false } },
    espSerialNumber: { type: String, required: true },
    gramPerMeal: { type: Number, default: 200 },
    howManyDropFoodToDay: { type: Number, default: 0 },
    bowlStatistic: [{
        date: { type: Date },
        howMuchHeAte: { type: Number },
    }],
});

dogSchema.pre('save', async function (next) {
    const dog = this;

    try {
        const arduino = await Arduino.findOne({ arduinoId: dog.espSerialNumber });
        if (arduino == null) {
            return next(createError(404, "arduino ID not found"));
        }
    } catch (err) {
        return next(err);
    }
});

dogSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Dog', dogSchema);