import express from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

router.use(express.json());

// Serve the proto file for clients (so React can fetch and parse it if desired)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.get("/protos/user.proto", (req, res) => {
  const protoPath = path.join(__dirname, "../protos/user.proto");
  res.sendFile(protoPath);
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
