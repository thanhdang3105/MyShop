const mongoose = require('mongoose');

async function connect() {
    try {
        console.log(process.env.URI_DB)
        await mongoose.connect(process.env.URI_DB);
        console.log('Connect Successfully');
    } catch (e) {
        console.log('Connect Fail');
    }
}

module.exports = {
    connect,
};
