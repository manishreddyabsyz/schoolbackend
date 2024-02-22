// routes/authroutes.js
const express = require('express');
const { authenticateUser } = require("../controllers/authcontrollers");
const { postusers } =require("../controllers/postuserscontrollers");

const router = express.Router();

router.post('/login', authenticateUser);
router.post("/signup",postusers)

module.exports = router;
