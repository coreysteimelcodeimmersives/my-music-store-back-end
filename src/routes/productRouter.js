const express = require('express');
const productRouter = express.Router();
const { createProduct, getProducts } = require('../services/productService');

productRouter.post('/create-product', createProduct);

productRouter.get('/get-products', getProducts);

module.exports = productRouter;
