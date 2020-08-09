const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const dogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String },
    birthDate: { type: Date },
    ownerID: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    vaccines: [{
        name: { type: String },
        date: { type: Date },
    }],
    flags: { type: Map, of: Boolean, default: { dropFood: false, makeNoise: false } },
    espSerialNumber: { type: String, required: true },
});

dogSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Dog', dogSchema);