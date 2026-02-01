import { Product } from "../models/product.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("vendor", "shopName").populate("shop", "name logoUrl");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json(product);
});
