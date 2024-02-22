const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models").Users;
const postusers = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
   const hashedpassowrd=await bcrypt.hash(password,10);
    const user = await User.findOne({ where: { role } });
    if(user!==null){

    if (user.role === "Admin") {
        if(user.email===email ){
            return res.status(400).json({message:"Already This User Exists"})
        }
        return res.status(400).json({ message: "Admin should be one member" });
      }
   if(user.role!=="Admin"){
    const finduser=await User.findOne({where : {email}})
    if(finduser.email===email && finduser.password!==null ){
        console.log("hello")
        return res.status(400).json({message : `User already Registred as ${finduser.role}`})
    }
    if(finduser.email===email && finduser.username===username && finduser.role===role){
        await User.update({password :hashedpassowrd},{where : {id : finduser.id}})
        return res.status(200).json({ message: "New user Signup Successfully",role });
    }else{
        return res.status(404).json({message :" Invalid Details"})
    }

   }
};
    const createUser = await User.create({ username, email, password:hashedpassowrd, role });
    const accessToken = jwt.sign({ id: createUser.id, role: createUser.role }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: createUser.id, role: createUser.role }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
    await User.update(
        { access_token: accessToken },
        { where: { id: createUser.id} }   
      );
    return res.status(200).json({ message: "New user Signup Successfully",role });
   

   

  
    
  } catch (error) {
    console.log("Error adding user", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { postusers };
