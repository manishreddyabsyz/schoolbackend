const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const User = require("../../models").Users;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "manish.naini@absyz.com",
    pass: "oulx aeas vznb vvcf",
  },
});
const sendEmail = async (userdetails,otp) => {
  try {
    let info = await transporter.sendMail({
      from: "manish.naini@absyz.com",
      to: userdetails.email,
      subject: "Welcome to school based application",
      html: `
            <h1>Welcome ${userdetails.username}!</h1>
            <p>Your registration details:</p>
            <p>Username: ${userdetails.username} </p>
            <p>Email: ${userdetails.email}</P>
            <p>Role: ${userdetails.role}</p>
            <p>${userdetails.role === "Student" ? "Designation" : "Subject"}: ${
        userdetails.role === "Student"
          ? userdetails.designation
          : userdetails.subject
      }</p>
      <p>Otp:${otp}</p>
            <a href=http://localhost:3000/forgotpassword target=_blank>Click here to set password</a>
          `,
    });
    console.log("Message sent :%s", info.messageId);
  } catch (error) {
    console.log("Error occured while sending Email", error);
  }
};


const authenticateUser = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body, "hello");
  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    const role = user.role;

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    console.log(user.username, username, "username");
    if (user.username !== username) {
      return res.status(400).json({ message: "Invalid username" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    await User.update({access_token:accessToken},{where :{id:user.id} })
    return res.json({ accessToken, refreshToken, role, id: user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(email,"email");
  try {
    const checkEmailExist = await User.findOne({ where: { email } });
    if (!checkEmailExist) {
      return res.status(400).json({ message: "Email is not Registered" });
    }
    const genrateOtp = Math.floor(100000 + Math.random() * 900000);
    const otp_expiry = Date.now() + 5 * 60 * 1000;
    console.log(genrateOtp, otp_expiry, "otp");
    await User.update(
      { otp: genrateOtp, otpexpiry: otp_expiry },
      { where: { id: checkEmailExist.id } }
    );
    await sendEmail(checkEmailExist,genrateOtp)
    return res.status(200).json({ message: "Otp sent successfully" });
  } catch (error) {
    console.log("Error sending otp", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const verifyOtp=async(req,res)=>{

  const {email,otp}=req.body;
  console.log(email,otp)
  try{

    const getemail=await User.findOne({where : {email}});
    const otpExpiry=getemail.otpexpiry;
    console.log(otpExpiry,"otpexpiry");
    const getOtp=getemail.otp
    const currentTime=Date.now()
    if(otpExpiry>currentTime){
      console.log("first")
      console.log(otp===getOtp);
      if(otp==getOtp){
        console.log("second")
        return res.status(200).json({message:"OTP Verified Successfully"})
      }else{
        return res.status(400).json({message:"OTP is not valid "})
      }
    }else{
      return res.status(404).json({message:"OTP Validity Expired"})
    }

  }catch(error){
    console.log("Internal server error",error);
    return res.status(500).json({message:"Internal server error"})
  }

}

const forgotpassword=async(req,res)=>{
  const {email,forgotpassword}=req.body;
  try{
    const user= await User.findOne({where:{email}});
    if(!user){
      res.status(400).json({message:"User not found"})
    }
    const hashedpassowrd=await bcrypt.hash(forgotpassword,10);
    await User.update({password : hashedpassowrd},{where : {id:user.id}});
    res.status(200).json({message :"Password set successfully"})
  }catch(error){
    console.log("error forgotpassword",error)
   res.status(500).json({message:"Internal server error"})
  }


}
module.exports = { authenticateUser, sendOtp ,verifyOtp,forgotpassword};
