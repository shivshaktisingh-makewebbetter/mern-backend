require('dotenv').config();
const express = require("express")
const cors = require('cors');
const app = express()
app.use(cors());
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection
db.on('error' , (error)=> console.error(error))
db.once('open' , ()=> console.log('Database connected'))
app.use(express.json());
const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers' , subscribersRouter)
app.listen(3000, () => console.log("server started"));
