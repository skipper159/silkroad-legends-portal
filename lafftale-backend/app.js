
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
app.use("/api/auth", require("./routes/auth-v2"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin_tickets", require("./routes/admin_tickets"));
app.use("/api/user_tickets", require("./routes/user_tickets"));
app.use("/api/donation", require("./routes/donation"));
app.use("/api/rankings", require("./routes/rankings"));
app.use("/api/characters", require("./routes/characters"));
app.use("/api/characterdetails", require("./routes/characterdetails"));
app.use("/api/silk", require("./routes/silk"));
app.use("/api/gameaccount", require("./routes/gameaccount"));
app.use("/api/inventory", require("./routes/inventory"));
//app.use("/api/Payment", require("./routes/Payment/payment"));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lafftale backend running on port ${PORT}`));