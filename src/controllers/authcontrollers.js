const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User= require("../../models").Users;

const   authenticateUser = async (req, res) => {
  const { username, password } = req.body;
console.log(req.body,"hello")
  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    const role=user.role;

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    console.log(user.username,username,"username");
    if(user.username!==username){
      return res.status(400).json({message : "Invalid username"})
    }
   
    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
    return res.json({ accessToken,refreshToken,role,id:user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { authenticateUser };
