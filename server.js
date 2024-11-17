const express = require('express')
const app = express(); 
const db = require('./db')
require('dotenv').config();

const bodyParser = require("body-parser")
app.use(bodyParser.json())
const PORT = process.env.PORT || 4000;

// app.use(express.json());


const userRoutes = require("./routes/userRoutes")
const candidateRoutes = require("./routes/candidateRoutes")

app.use("/user", userRoutes);
app.use("/candidate",candidateRoutes);



app.listen(PORT, () =>{
    console.log("listening on port :: 4000")
})

