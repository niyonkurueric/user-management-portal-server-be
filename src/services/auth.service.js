import User from "../models/userModel.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export class AuthService {
  static async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return { token };
  }
}
