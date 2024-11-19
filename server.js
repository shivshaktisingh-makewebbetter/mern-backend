require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Database connected"));
app.use(express.json());

const subscribersRouter = require("./routes/subscribers");
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const userListing = require('./routes/user');
const categoryRouter = require('./routes/category');
const productRouter = require('./routes/product');
app.use("/subscribers", subscribersRouter);
app.use('/register', registerRouter); // Route for registration
app.use('/login', loginRouter);
app.use('/user', userListing);
app.use('/category', categoryRouter);
app.use('/product' , productRouter);


// Start server
app.listen(3000, () => console.log("Server started on port 3000"));
