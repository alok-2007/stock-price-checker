const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new Schema({
    symbol: { type: String, required: true, unique: true},
    likes: {type: Number, default: 0},
    likeby: {type: [String], default: []},
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;