const mongoose = require('mongoose')

const mongURL = "mongodb+srv://rohitfoujdar8696:h7SEQuN0Dtqw3wT3@votingapp.8qi6k.mongodb.net/?retryWrites=true&w=majority&appName=votingapp";

main().catch(err => console.log(err));

async function main() {
  try{
    await mongoose.connect(mongURL);
    console.log("Mongodb connected")
  }catch(err){
    console.log("DB connection error -> ", err)
  }
}