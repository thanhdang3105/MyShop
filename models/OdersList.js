const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OdersList = new Schema({
    user: {
        type: String,
        required: true,
    },
    name:{
        type:String,
        required: true,
    },
    total:{
        type: Number,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    note:{
        type: String,
        default: ''
    },
    transport:{
        type: String,
        default: 'normal'
    },
    payMethod:{
        type: String,
        default: 'cod'
    },
    status:{
        type: String,
        default: 'pending'
    },
    discount:{
        type:String,
    }
})

module.exports = mongoose.model('OdersList', OdersList);
