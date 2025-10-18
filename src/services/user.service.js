import User from "../models/userModel.js";
import { hashPassword } from "../utils/hash.js";
import { hashEmail, signDigest } from "../utils/crypto.js";

class UserService {
  async createUser(data) {
    if (await User.findOne({ where: { email: hashEmail(data.email) } }))
      throw new Error("Email already exists");
    const password = await hashPassword(data.password ?? "password123");
    const email = hashEmail(data.email);
    return User.create({ ...data, email, password, emailSignature: signDigest(email) });
  }

  getAllUsers() {
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
    if (data.password) data.password = await hashPassword(data.password);
    if (data.email) {
      const email = hashEmail(data.email);
      data.email = email;
      data.emailSignature = signDigest(email);
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
