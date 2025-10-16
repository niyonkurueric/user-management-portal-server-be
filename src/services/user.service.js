import User from "../models/userModel.js";
import { hashPassword } from "../utils/hash.js";

class UserService {
  async createUser(data) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await hashPassword(data.password ?? "password123");
    const newUser = await User.create({ ...data, password: hashedPassword });
    return newUser;
  }

  async getAllUsers() {
    return User.findAll({ order: [["createdAt", "desc"]] });
  }

  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await user.update(data);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");
    await user.destroy();
    return true;
  }
}

export default new UserService();
