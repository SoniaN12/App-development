const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
  searchProducts
} = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", addProduct);

module.exports = router;