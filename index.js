// const express = require("express");
// const cors = require("cors");

// const app = express();
// const port = 3000;

// // Enable CORS for all origins during development (replace with specific origins for production)
// app.use(cors());

// app.use(express.json());

// let products = []; // Array to store product objects

// // Function to generate new product data
// function generateNewProduct() {
//   const newProduct = {
//     id: products.length ? products[products.length - 1].id + 1 : 1,
//     timestamp: new Date().toISOString(),
//   };
//   products.push(newProduct); // Add new product to the array
// }

// // Update data every 10 seconds
// setInterval(generateNewProduct, 10000);

// app.get("/", (req, res) => {
//   res.json({ products }); // Send the entire products array wrapped in a "products" key
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

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

const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let products = []; // Array to store product objects (as before)

// Function to generate new product data (as before)
function generateNewProduct() {
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    timestamp: new Date().toISOString(),
  };
  products.push(newProduct); // Add new product to the array
}

// Update data every 10 seconds
const interval = setInterval(generateNewProduct, 10000);

// Route for sending SSE events to the client
app.get("/data-stream", (req, res) => {
  res.set('Content-Type', 'text/event-stream');
  
  // Send SSE events periodically
  const intervalId = setInterval(() => {
    // Example: Sending products array as JSON data
    res.write(`data: ${JSON.stringify(products)}\n\n`);
  }, 1000); // Change interval as needed

  // Clean up on client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId); // Clear the interval associated with this client
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

