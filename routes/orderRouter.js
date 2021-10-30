const express = require("express");
const Order = require("../models/order");
const OrderItems = require("../models/orderItems");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList) {
      res.status(500).json({ status: "fail", message: "No Orders Found" });
    }
    res.status(200).send(orderList);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });
    res.status(200).send(order);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItems({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItems.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    order = await order.save();

    if (!order) return res.status(400).send("the order cannot be created!");

    res.send(order);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.patch("/:id", async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
    }
  );
  if (!order) {
    return res.status(404).json({
      status: "fail",
      message: "No order on that id",
    });
  }
  res.status(200).send(order);
});

router.delete("/:id", async (req, res, next) => {
  const order = await Order.findByIdAndRemove(req.params.id);
  if (!order) {
    return res.status(404).json({
      status: "fail",
      message: "No order on that id",
    });
  }
  await order.orderItems.map(async (orderItem) => {
    await OrderItems.findByIdAndRemove(orderItem);
  });
  res.status(204).json({
    status: "success",
  });
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
      return res.status(400).send("The order sales cannot be generated");
    }

    res.status(200).send(totalSales);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/get/count", async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        count: orderCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

router.get("/get/userorders/:userid", async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!userOrderList) {
      return res.status(500).json({
        status: "fail",
        message: "No order found for this user",
      });
    }
    res.status(200).send(userOrderList);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error,
    });
  }
});

module.exports = router;
