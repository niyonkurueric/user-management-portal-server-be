import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import { hashPassword } from "../utils/hash.js";

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpass";

    const existing = await User.findOne({ where: { email: adminEmail } });
    if (existing) {
      console.log(`Admin user already exists: ${adminEmail}`);
      process.exit(0);
    }

    const hashed = await hashPassword(adminPassword);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      status: "active",
    });
    console.log(`Admin created: ${adminEmail}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedAdmin();
