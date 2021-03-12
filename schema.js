const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    name: {
        type: String,
        required: [true, 'Movie name is required'],
        unique: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
    },
    director: {
        type: String,
        required: [true, 'Director name is required'],
    }
});

module.exports = schema;