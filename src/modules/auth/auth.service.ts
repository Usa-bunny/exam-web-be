const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../../models");

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  async login({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email not found");

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new Error("Password is incorrect");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    const { password: _, ...userData } = user.toJSON();

    return {
      user: userData,
      token,
    };
  }
}

module.exports = new AuthService();
