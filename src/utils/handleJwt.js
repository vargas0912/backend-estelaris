const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * sign token method
 * @param {Object} user User object required
 */
const tokenSign = async (user) => {
  const sign = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '2h'
    }
  );

  return sign;
};

/**
 * Verify token method
 * @param {String} tokenJwt Sesion token
 * @returns
 */
const verifyToken = async (tokenJwt) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { tokenSign, verifyToken };
