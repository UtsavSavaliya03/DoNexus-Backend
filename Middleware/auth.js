require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req?.body?.token || req?.query?.token || req?.headers["authorization"];
  const extractedToken = token && token?.startsWith("Bearer ") ? token.split(" ")[1] : token;

  if (!extractedToken) {
    return (
      res.status(401).json({
        status: false,
        message: "A token is required for authentication."
      })
    )
  }

  try {
    const decoded = jwt.verify(extractedToken, process.env.JWT_TOKEN_SECRET_KEY);
    req.user = decoded;
  } catch (error) {
    return (
      res.status(401).json({
        status: false,
        message: "Invalid Token.",
        data: error
      })
    )
  }
  return next();
};

module.exports = verifyToken;