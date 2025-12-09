const jwt = require("jsonwebtoken");

function authManager() {
  verify = (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: "Unauthorized",
        });
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = verified.userId;
      req.userEmail = verified.email;

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({
        loggedIn: false,
        user: null,
        errorMessage: "Unauthorized",
      });
    }
  };

  verifyUser = (req) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return null;
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      return verified.userId;
    } catch (err) {
      return null;
    }
  };

  signToken = (userId, email) => {
    return jwt.sign(
      {
        userId: userId,
        email: email,
      },
      process.env.JWT_SECRET
    );
  };

  return {
    verify,
    verifyUser,
    signToken,
  };
}

const auth = authManager();
module.exports = auth;
