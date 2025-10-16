/* eslint-env node */
import dotenv from "dotenv";
dotenv.config();

import userService from "../services/user.service.js";

const run = async () => {
  try {
    const user = await userService.createUser({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpass",
          assigned: false,
        });

    const { password: _p, ...data } = user.toJSON();
    console.log("Created user:", data);
    process.exit(0);
  } catch (err) {
    console.error("Create test user failed:", err);
    process.exit(1);
  }
};

run();
