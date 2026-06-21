import asyncHandler from 'express-async-handler';
import Category from '../models/CategoryModel.js';

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('Danh mục đã tồn tại');
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
});

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne(); // Hoặc category.remove() tùy phiên bản Mongoose
    res.json({ message: 'Đã xóa danh mục' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }
});

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }
});

export { createCategory, getCategories, deleteCategory, updateCategory };