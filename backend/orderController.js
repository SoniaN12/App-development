const Order = require("../models/Order");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addOrder = async (req, res) => {
  try {
    const order = new Order({
      productId: req.body.productId,
      productName: req.body.productName,
      price: req.body.price,
      payment: req.body.payment,
      status: req.body.status
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};