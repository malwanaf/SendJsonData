const mongoose = require("mongoose");

const mySchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});

module.exports = mongoose.model("MySchema", mySchema);