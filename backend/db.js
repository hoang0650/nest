const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://hoang0650:Kobiet123@cluster0.jz1sw.mongodb.net/Nest?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;