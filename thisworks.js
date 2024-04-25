const express = require('express');
const app = express();
const PORT = 3001;
const cors = require('cors');

const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

// connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/newTestDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// get default connection
const db = mongoose.connection;

// bind connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// define schema
const strikeSchema = new mongoose.Schema({
  strikeId: { type: Number, unique: true },
  timestamp: { type: Date, default: Date.now },
});

// create model based on schema
const Strike = mongoose.model('Strike', strikeSchema);

// read and parse data from JSON file
function readJSONFile(filepath) {
  try {
    const fileData = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading the JSON file: ', error);
    return null;
  }
}

// save strikes data to MongoDB
function saveStrikeToMongoDB() {
  const filePath = path.join(__dirname, 'data', 'strikes.json');
  const strikeData = readJSONFile(filePath);

  if (strikeData && Array.isArray(strikeData)) { // Check if strikeData is an array
    strikeData.forEach((strike) => {
      // Assuming each strike object has id and timestamp properties
      const newStrike = new Strike({
        strikeId: strike.id, // Assuming 'id' corresponds to 'strikeId' in the schema
        timestamp: strike.timestamp // Assuming 'timestamp' corresponds to 'timestamp' in the schema
      });
      newStrike.save((err, savedStrike) => {
        if (err) {
          console.error('Error saving strike: ', err);
        } else {
          console.log('Strike saved', savedStrike);
        }
      });
    });
  }
}


// call the function periodically
setInterval(saveStrikeToMongoDB, 60000);

// define api endpoint to fetch from mongodb
app.get('/api/strikes', async (req, res) => {
  try {
    const strikes = await Strike.find({ /* query criteria if needed */ });

    // send data to client as json response
    res.json(strikes);
  } catch (error) {
    console.error('Error fetching strike data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/// SSE endpoint to send real-time updates to clients
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Function to send updates to the client
  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Set up a loop to send updates periodically
  const intervalId = setInterval(() => {
    Strike.find().sort({ timestamp: -1 }).limit(1) // Fetch latest strike
      .then((latestStrike) => {
        if (latestStrike) {
          sendUpdate(latestStrike);
        }
      })
      .catch((error) => {
        console.error('Error fetching strike data:', error);
      });
  }, 1000); // Adjust the interval as needed

  // Close the connection when the client disconnects
  req.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
    res.end();
  });
});



// start the server
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
