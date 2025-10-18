import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database synced successfully");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();
