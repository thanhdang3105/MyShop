const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(`mongodb+srv://ThanhGroup:${process.env.PASSWORD_DB}@cluster0.ltcw2a1.mongodb.net/Myshop`);
        console.log('Connect Successfully');
    } catch (e) {
        console.log('Connect Fail');
    }
}

module.exports = {
    connect,
};
