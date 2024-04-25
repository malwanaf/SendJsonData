const mongoose = require("mongoose");
const MySchema = require("./MySchema.js");

mongoose.connect(
    "mongodb://localhost:27017/testDB",
    () => {
        console.log("Connected to MongoDB")
    },
    err => {
        console.error(err);
    }
);

async function test() {
    const x = new MySchema(
        { 
            firstName: "Naman", 
            lastName: "Thanki" 
        }
    );
    await x.save();

    console.log(x);
}

test();