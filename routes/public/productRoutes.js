//routes//public//productroutes.js
const express = require("express");
const router = express.Router();
const {
  getPublicProducts,getProductsByCategory
} = require("../../controllers/public/productController");

router.get("/", getPublicProducts); 
router.get("/grouped", getProductsByCategory); 
module.exports = router;
