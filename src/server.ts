import cors from "cors";
import express from "express";
import figlet from "figlet";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import environment from "./environment";
import router from "./routers";
import swaggerDoc from "./swagger.json";

const app = express();

const PORT = environment.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(
  morgan(
    `:remote-addr - [:date[web]] ":method :status +:total-time[2]ms :res[content-length] ":user-agent" - :url `
  )
);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    customSiteTitle: "Swagger | API Chimaera - Topocart",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDoc);
});

app.use("/", router);

app.listen(Number(PORT), "0.0.0.0", async () => {
  figlet("API Chimaera", function (err, data) {
    console.log(
      `################################################################################################################`
    );
    console.log(data);
    console.log(
      `####################################### Iniciada na porta ${PORT} ################################################ \n`
    );
  });
});
