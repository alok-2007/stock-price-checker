const mongoose = require('mongoose')
require('dotenv').config;

const db = mongoose.connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Connection failed:', err));
    
module.exports = db
