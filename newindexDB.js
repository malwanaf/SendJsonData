const express = require('express');
const app   = express();
const PORT = 3000;
const cors  = require('cors');

app.use(cors)

// connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/strikesDB',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// get def connection
const db = mongoose.connection;

// bind connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// define schema
const strikeSchema = new mongoose.Schema({
  strikeId: {type: Number, unique:true},
  timestamp: {type: Date, default: Date.now},
  distance: Number,
  intensity: Number,
});

// create model based on schema
const Strike = mongoose.model('Strike', strikeSchema);

// Example data
const newStrike = new Strike({
    strikeId: 1,
    timestamp: new Date(),
    distance: 10,
    intensity: 5,
    });

// save data
newStrike.save((err, saveStrike) => {
    if (err) {
        console.error('Error saving strike: ', err);
    } else {
        console.log('Strike saved', savedStrike);
    }
    });