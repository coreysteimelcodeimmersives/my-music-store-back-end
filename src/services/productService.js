const ProductModel = require('../models/ProductModel');
const { verifyUserIsAdmin } = require('./permissionService');

const cleanProduct = (productDocument) => {
  return {
    id: productDocument._id,
    title: productDocument.title,
    description: productDocument.description,
    brand: productDocument.brand,
    price: productDocument.price,
    image: productDocument.image,
  };
};

const createProduct = async (req, res, next) => {
  try {
    //Grab the data from network request
    const { productData } = req.body;

    verifyUserIsAdmin(req, res);

    // store it in the database
    const productDocument = new ProductModel(productData);
    await productDocument.save();

    // return it to the front end after
    res.send({ product: cleanProduct(productDocument) });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find();

    // return it to the front end after
    res.send({ products: products.map(cleanProduct) });
  } catch (error) {
    next(error);
  }
};

const ProductService = { getProducts, createProduct };
module.exports = ProductService;
