// app.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require("./routes/authroutes");
const tokenroutes=require("./routes/tokenroutes");
const adminroutes=require("./routes/adminroutes");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());

require('dotenv').config();

app.use(cors());
// Routes
app.use('/auth', authRoutes);
app.use("/",tokenroutes)
app.use("/",adminroutes)

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
