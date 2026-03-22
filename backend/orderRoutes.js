const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);

module.exports = router;