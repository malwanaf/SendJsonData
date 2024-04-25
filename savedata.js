const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Create a schema for your data
const dataSchema = new mongoose.Schema({
  id: Number,
  timestamp: Date
});

// Create a model based on the schema
const Data = mongoose.model('Data', dataSchema);

// Route to generate data every 5 seconds and save to MongoDB
setInterval(() => {
  const newData = new Data({
    id: Math.floor(Math.random() * 100) + 1,
    timestamp: new Date()
  });
  newData.save()
    .then(() => console.log('Data saved'))
    .catch(err => console.log(err));
}, 5000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
