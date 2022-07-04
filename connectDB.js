const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log('Connect Successfully');
    } catch (e) {
        console.log(e)
        console.log('Connect Fail');
    }
}

module.exports = {
    connect,
};
