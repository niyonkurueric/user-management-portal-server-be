import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDir = path.join(__dirname, "../swagger");

let swaggerSpec;

try {
  if (fs.existsSync(swaggerDir)) {
    const files = fs.readdirSync(swaggerDir).filter((f) => f.endsWith(".json"));
    if (files.length > 0) {
      const merged = {};
      for (const file of files) {
        const content = fs.readFileSync(path.join(swaggerDir, file), "utf8");
        const doc = JSON.parse(content);
        for (const key of Object.keys(doc)) {
          if (key === "paths") {
            merged.paths = merged.paths || {};
            for (const [p, methods] of Object.entries(doc.paths || {})) {
              merged.paths[p] = merged.paths[p] || {};
              for (const [m, op] of Object.entries(methods || {})) {
                merged.paths[p][m] = Object.assign({}, merged.paths[p][m] || {}, op || {});
              }
            }
          } else if (key === "components") {
            merged.components = merged.components || {};
            for (const compKey of Object.keys(doc.components || {})) {
              merged.components[compKey] = Object.assign(
                {},
                merged.components[compKey] || {},
                doc.components[compKey] || {}
              );
            }
          } else {
            merged[key] = merged[key] || doc[key];
          }
        }
      }
      merged.openapi = merged.openapi || "3.0.0";
      merged.info = merged.info || { title: "User Management Portal API", version: "1.0.0" };
      const port = process.env.PORT || 3000;
      merged.servers = [{ url: `http://localhost:${port}/api` }];

      swaggerSpec = merged;
    }
  }
} catch (err) {
  console.error(
    "Failed to read/merge swagger directory, falling back to swagger-jsdoc:",
    err && err.message
  );
}

if (!swaggerSpec) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "User Management Portal API",
        version: "1.0.0",
        description: "API documentation for the User Management Portal backend",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}/api`,
        },
      ],
    },
    apis: ["./src/routes/*.js", "./src/controllers/*.js"],
  };

  swaggerSpec = swaggerJSDoc(options);
}

export default swaggerSpec;
