const express = require("express");
const Razorpay = require("razorpay");
const createError = require("http-errors");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_KTtrTFjPGvvHhi",
  key_secret: "1mV658Ie2U8iFvkI4IAIuf9l",
});

router.post("/createOrder", async (req, res, next) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount,
      currency: req.body.currency,
    });
    res.status(201).send(order);
  } catch (error) {
    return next(createError(404, "payment error", { name: "error" }));
  }
});

module.exports = router;
