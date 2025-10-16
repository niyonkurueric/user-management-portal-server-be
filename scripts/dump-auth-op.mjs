import swaggerSpec from "../src/swagger.js";

console.log(JSON.stringify(swaggerSpec.paths["/auth/login"], null, 2));
