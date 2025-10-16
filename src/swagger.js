import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDir = path.join(__dirname, "../swagger");

let swaggerSpec;

// If a folder `swagger/` exists, attempt to load and merge all .json files inside it.
try {
  if (fs.existsSync(swaggerDir)) {
    const files = fs.readdirSync(swaggerDir).filter((f) => f.endsWith(".json"));
    if (files.length > 0) {
      // merge strategy: combine paths and components; other top-level fields taken from first file and overridden by later files
      const merged = {};
      for (const file of files) {
        const content = fs.readFileSync(path.join(swaggerDir, file), "utf8");
        const doc = JSON.parse(content);
        // merge top-level simple props
        for (const key of Object.keys(doc)) {
          if (key === "paths") {
            merged.paths = merged.paths || {};
            // deep-merge by path and method so operation-level fields (like security) are preserved
            for (const [p, methods] of Object.entries(doc.paths || {})) {
              merged.paths[p] = merged.paths[p] || {};
              for (const [m, op] of Object.entries(methods || {})) {
                merged.paths[p][m] = Object.assign({}, merged.paths[p][m] || {}, op || {});
              }
            }
          } else if (key === "components") {
            merged.components = merged.components || {};
            // merge component sub-objects
            for (const compKey of Object.keys(doc.components || {})) {
              merged.components[compKey] = Object.assign(
                {},
                merged.components[compKey] || {},
                doc.components[compKey] || {}
              );
            }
          } else {
            // assign or override other top-level fields
            merged[key] = merged[key] || doc[key];
          }
        }
      }

      // Ensure an openapi version and info exist
      merged.openapi = merged.openapi || "3.0.0";
      merged.info = merged.info || { title: "User Management Portal API", version: "1.0.0" };

      swaggerSpec = merged;
    }
  }
} catch (err) {
  // eslint-disable-next-line no-console
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
          url: "http://localhost:3000/api",
        },
      ],
    },
    // Files containing annotations as above
    apis: ["./src/routes/*.js", "./src/controllers/*.js"],
  };

  swaggerSpec = swaggerJSDoc(options);
}

export default swaggerSpec;
