// routes/authroutes.js
const express = require('express');
const { authenticateUser, sendOtp, verifyOtp, forgotpassword } = require("../controllers/authcontrollers");
const { postusers } = require('../controllers/signupcontrollers');


const router = express.Router();

router.post('/login', authenticateUser);
router.post("/verify-otp",verifyOtp)
router.post("/send-otp",sendOtp)
router.post("/forgotpassword",forgotpassword)
router.post("/signup",postusers)

module.exports = router;
