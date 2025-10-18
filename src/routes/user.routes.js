import express from "express";
import * as userController from "../controllers/user.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const userRoutes = express.Router();

userRoutes.get("/", userController.getUsers);

userRoutes.post("/", requireAdmin, userController.createUser);

userRoutes.get("/export", userController.exportUsersProto);
userRoutes.get("/public-key", userController.getPublicKey);
userRoutes.post("/verify-signature", userController.verifyUserSignature);
userRoutes.get("/:id", userController.getUser);

userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);

export default userRoutes;
