const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing');

const MONGO_URL = "mongodb://127.0.0.1:27017/lodgify";

main()
    .then(() =>{
        console.log("connected to DB")
    })
    .catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGO_URL);
    // use `await mongoose.connect('mongodb://user:password@
}
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "67eb691e13f1452ad98582cc"}));
    await Listing.insertMany(initData.data);
    console.log("Data initialized");
};
initDB();