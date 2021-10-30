// package imports
const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const connectToDb = require("./db/mongoconnect");
const createError = require("http-errors");
//jwt
const authJwt = require("./helpers/jwt");

// error handler
const errorHandler = require("./helpers/error-handler");

//router imports
const productRoute = require("./routes/productRouter");
const userRoute = require("./routes/userRouter");
const categoryRoute = require("./routes/categoryRouter");
const orderRoute = require("./routes/orderRouter");
const paymentRoute = require("./routes/paymentRoute");

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(helmet());
app.use(cors({ origin: "*" }));
app.options("*", cors());
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use("/public/images", express.static(__dirname + "/public/images"));
app.use("/public/css", express.static(__dirname + "/public/css"));
app.use(authJwt());

//routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Easy Shop Rest Api",
  });
});
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/payments", paymentRoute);

//DATABASE
connectToDb();

app.all("*", (req, res, next) => {
  next(createError(404, "Route is invalid", { name: "Invalid Route" }));
});
//global error handler
app.use(errorHandler);

//server
app.listen(PORT, () => console.log(`Server listening at Port ${PORT}`));
