const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const dogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String },
    birthDate: { type: Date },
    ownerID: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
});

dogSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Dog', dogSchema);