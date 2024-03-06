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
// const endPoints=[
//   "/auth/login",
//   "/auth/signup",
//   "/auth/verify-otp",
//   "/auth/send-otp",
//   "/auth/forgotpassword",
//   "/delete-student",
//   "/delete-teacher",
//   "/add-teachers",
//   "/add-students",
//   "/get-teachers",
//   "/get-students",
//   "/update-teacher",
//   "/update-student",
//   "/refresh-token",
//   "/verify-access-token",
//   "/admin-profile-details",
//   "/update-admin-details/"
// ]

// const validateEndPoint=(req,res,next)=>{
//   const requestPath=req.path;
//   if(!endPoints.includes(requestPath)){
//     return res.status(404).json({ message: 'Invalid endpoint' });
//   }
//   next();
// }
// app.use(validateEndPoint);
app.use('/auth', authRoutes);
app.use("/",tokenroutes)
app.use("/",adminroutes)

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
