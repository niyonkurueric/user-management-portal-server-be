import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import sequelize from "./config/database.js";
import { Logger } from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    Logger.info("Database synced successfully");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    Logger.error("Database connection failed:", err);
  }
})();
