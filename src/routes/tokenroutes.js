const express = require('express');
const {verifyAccessToken} = require("../middlewares/tokenmiddleware")
const {verifyRefreshToken}=require("../middlewares/tokenmiddleware")
const router=express.Router();
router.post("/verify-access-token", verifyAccessToken);
router.post("/refresh-token",verifyRefreshToken)
module.exports=router;