import { protect } from "./authMiddleware.js";

export const requireAdmin = [
  protect,
  (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin privileges required" });
    }
    next();
  },
];

export default requireAdmin;
