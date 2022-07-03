const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Catalogs = new Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  category: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('Catalogs', Catalogs);