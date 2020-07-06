const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://PetFeeder-Admin:lndd123456@petfeederdb-c5umy.mongodb.net/PetFeederDB?retryWrites=true&w=majority"

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

module.exports = { mongoose };