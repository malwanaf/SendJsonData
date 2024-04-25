const express = require('express');
const app   = express();
const PORT = process.env.PORT || 3000;
const cors  = require('cors');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// connect to mongodb
mongoose.connect('mongodb://127.0.0.1:27017/testDB',{
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

// define mongoose schema
const messageSchema = new Schema({
    text: String
});

const Message = mongoose.model('Message', messageSchema);

// sse endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data) => {
        res.write('data: ${JSON.stringify(data)}\n\n');
    };

    //  send initial message
    sendEvent({ message: 'Connected to SSE Server'});

    // Stream msg from mongo
    const stream = Message.find().cursor();
    stream.on('data', (doc) => {
        sendEvent(doc);
    });
});

// start server
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});