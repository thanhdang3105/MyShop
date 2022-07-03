const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartList = new Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageURL: {
    type: String,
    default: 'empty.svg'
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 1,
  },
  slug: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('CartList', CartList);