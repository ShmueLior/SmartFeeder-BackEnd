const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const arduinoSchema = new mongoose.Schema({
    arduinoId: { type: String, required: true, unique: true },
});

arduinoSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Arduino', arduinoSchema);