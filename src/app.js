import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();

app.use(express.json());

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.static("public"));

app.get("/api-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.get("/api-docs/swagger-initializer.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(
    `window.onload = function() {\n  window.ui = SwaggerUIBundle({\n    url: \"/api-docs/swagger.json\",\n    dom_id: '#swagger-ui',\n    deepLinking: true,\n    presets: [\n      SwaggerUIBundle.presets.apis,\n      SwaggerUIStandalonePreset\n    ],\n    plugins: [\n      SwaggerUIBundle.plugins.DownloadUrl\n    ],\n    layout: \"StandaloneLayout\"\n  });\n};`
  );
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: "/api-docs/swagger.json",
    },
  })
);
app.use("/api/", routes);
app.use(errorHandler);

export default app;
