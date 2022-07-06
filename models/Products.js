const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator')
const AutoIncrement = require('mongoose-sequence')(mongoose)


const Schema = mongoose.Schema;

const Products = new Schema({
  _id: {type: Number,},
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
  },
  listImage: {
    type: Array,
  },
  slug: {
    type: String,
    slug: 'name',
    unique: true
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  catalog:{
    type: String,
  },
  category:{
    type: String,
  },
  collections:{
    type: String,
    default: ''
  },
  createdAt: {
      type: Date,
      default: Date.now()
  },
  sell:{
    type:Number,
    default: 0
  }
}, {
  _id: false,
  timestamps: true,
});

//Add plugin
mongoose.plugin(slug)

Products.plugin(AutoIncrement)

module.exports = mongoose.model('Products', Products);