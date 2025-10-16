import swaggerSpec from "../src/swagger.js";

console.log(
  "Has securitySchemes:",
  !!(swaggerSpec.components && swaggerSpec.components.securitySchemes)
);
console.log(
  "securitySchemes keys:",
  Object.keys((swaggerSpec.components && swaggerSpec.components.securitySchemes) || {}).join(", ")
);
console.log("\nPaths and their security requirements (if any):");
for (const [p, methods] of Object.entries(swaggerSpec.paths || {})) {
  for (const [m, op] of Object.entries(methods)) {
    console.log(
      `${m.toUpperCase()} ${p} - security: ${JSON.stringify(
        op.security || swaggerSpec.security || []
      )}`
    );
  }
}
