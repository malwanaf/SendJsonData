const express = require('express');
const app = express();
const PORT = 3000;
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

// Function to send updates to the client
const sendUpdate = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// SSE endpoint to send real-time updates to clients
app.get('/sse', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Get the latest strike timestamp sent to the client
  let lastTimestamp = req.headers['last-event-id'];
  if (!lastTimestamp) {
    lastTimestamp = new Date(0); // If no last timestamp, set to epoch
  } else {
    lastTimestamp = new Date(lastTimestamp);
  }

  // Set up MongoDB change stream to watch for new strikes
  const strikeStream = Strike.watch();

  // Send the initial response
  const initialStrikes = await Strike.find({ timestamp: { $gt: lastTimestamp } }).sort({ timestamp: 1 });
  initialStrikes.forEach(strike => {
    sendUpdate(res, strike);
  });

  // Listen for changes and send updates to the client
  strikeStream.on('change', async (change) => {
    if (change.operationType === 'insert' && change.fullDocument.timestamp > lastTimestamp) {
      sendUpdate(res, change.fullDocument);
      lastTimestamp = change.fullDocument.timestamp;
    }
  });

  // Close the connection when the client disconnects
  req.on('close', () => {
    console.log('Client disconnected');
    strikeStream.close();
    res.end();
  });
});

// start the server
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
