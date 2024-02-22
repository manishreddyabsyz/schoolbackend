const jwt = require("jsonwebtoken");
const User= require("../../models").Users;
const verifyAccessToken = (req, res, next) => {
    const token = req.body.token;
    if (!token) return res.status(401).json({ message: "Access token is not provided", authenticated: false });
    console.log(token, "verifyaccesstoken")
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        console.log(err, "verifyerr")
        if (err) return res.status(403).json({ message: "Access token is not valid", authenticated: false });
      
        const { role } = decoded;
        res.json({ authenticated: true, role });
    });
};

module.exports = { verifyAccessToken };

const verifyRefreshToken = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token is missing" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
        const { id, role } = decoded;

        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessToken = generateNewAccessToken({ id, role });
        res.json({ accessToken });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: "Refresh token is not valid" });
    }
};


const generateNewAccessToken=(data)=>{
  const {id,role}=data;
  const accessToken = jwt.sign({ id ,role}, process.env.JWT_ACCESS_TOKEN, { expiresIn: '15m' });
  console.log(accessToken,"accesstoken");
  return accessToken;
}


module.exports={verifyAccessToken,verifyRefreshToken};

