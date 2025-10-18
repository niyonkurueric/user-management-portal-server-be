import User from "../models/userModel.js";
import { hashPassword } from "../utils/hash.js";
import { hashEmail, signDigest } from "../utils/crypto.js";

class UserService {
  async createUser(data) {
    const emailHash = hashEmail(data.email);
    if (await User.findOne({ where: { email: emailHash } }))
      throw new Error("Email already exists");
    const password = await hashPassword(data.password ?? "password123");
    const ogEmail = data.email;
    return User.create({
      ...data,
      email: emailHash,
      ogEmail,
      password,
      emailSignature: signDigest(emailHash),
    });
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
      const plain = data.email;
      const emailHash = hashEmail(plain);
      data.email = emailHash;
      data.emailEncrypted = encryptEmail(plain);
      data.ogEmail = plain;
      data.emailSignature = signDigest(emailHash);
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
