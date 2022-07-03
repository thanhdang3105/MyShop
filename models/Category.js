const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Categorys = new Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  children: {
    type: Array,
    default: []
  }
});



module.exports = mongoose.model('Categorys', Categorys);