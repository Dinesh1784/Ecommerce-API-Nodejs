const mongoose = require("mongoose");

const orderItemsSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

const OrderItems = mongoose.model("OrderItems", orderItemsSchema);

module.exports = OrderItems;
