const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/newLDDB2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection error", err);
  process.exit();
});

// Define Item Schema and Model
const itemSchema = new mongoose.Schema({
    strikeId: { type: Number, unique: true },
    timestamp: { type: Date, default: Date.now },
    distance: Number,
    intensity: Number,
});

const Item = mongoose.model('Item', itemSchema);

// Define route to create a new item
app.post('/items/post', async (req, res) => {
    try {
      const newItem = await Item.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// route for delete an item
// Define route to delete an item by strikeId
app.delete('/items/:strikeId', async (req, res) => {
    const strikeId = req.params.strikeId;
    try {
        const deletedItem = await Item.findOneAndDelete({ strikeId });
        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', deletedItem });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Define route to stream items using SSE
app.get('/items/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // You might want to filter data based on clients' interest or send updates
  // whenever there's a change in the database
  const sendUpdates = async () => {
    try {
      const items = await Item.find();
      sendEvent(items);
    } catch (error) {
      console.error('Error sending updates:', error);
    }
  };

  // Send initial data
  sendUpdates();

  // Periodically send updates
  const interval = setInterval(sendUpdates, 5000); // Send updates every 5 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
