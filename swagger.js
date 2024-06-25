const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });
const pj = require("./package.json");

const doc = {
  info: {
    title: pj.name,
    description: pj.description,
    version: pj.version,
  },
  servers: [
    {
      url: "http://localhost:3000/",
      description: "API Local",
    },
  ],
  host: "api.libelula.gestaoengenharia.dev.br",
  externalDocs: {
    description: "api.libelula.gestaoengenharia.dev.br/swagger.json",
    url: "/swagger.json",
  },
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
};

const output = "./src/swagger.json";
const endpoints = ["./src/routers/index.ts"];

swaggerAutogen(output, endpoints, doc);
