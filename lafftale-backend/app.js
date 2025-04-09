
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger/swagger_lafftale_full.json", "utf8"));

const app = express();
app.use(cors());
app.use(express.json());

// Swagger-UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Deine API-Routen
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lafftale backend running on port ${PORT}`));