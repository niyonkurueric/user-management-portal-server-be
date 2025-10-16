import swaggerSpec from "../src/swagger.js";

console.log("Loaded swagger spec paths:");
console.log(Object.keys(swaggerSpec.paths || {}).join("\n"));
