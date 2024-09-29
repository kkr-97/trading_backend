const jwt = require("jsonwebtoken");

require("dotenv").config();

const verifyUser = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error("Error", e);
    res.status(401).json({ message: "UnAuthorized" });
  }
};

module.exports = verifyUser;
