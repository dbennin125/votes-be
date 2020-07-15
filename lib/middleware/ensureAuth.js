const User = require('../models/User');

module.exports = (req, res, next) => {
  const token = req.cookies.whatever;
  //reads cookies
  const user = User.verifyToken(token);
  //verifies cookie with user
  req.user = user;
  next();
};
