import asyncHandler from 'express-async-handler';
import Product from '../models/ProductModel.js';
import Category from '../models/CategoryModel.js';

// @desc    Fetch all products (Nâng cấp tính năng tìm kiếm bằng mã vạch)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  console.log('Backend nhận được keyword:', req.query.keyword);

  const pageSize = 999; 
  const page = Number(req.query.pageNumber) || 1;

  // 🎯 CHỈ TÌM THEO CÁC TRƯỜNG DẠNG CHỮ (Tên, Thương hiệu) VÀ MÃ VẠCH (Barcode)
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { barcode: { $regex: req.query.keyword, $options: 'i' } }, // Quét mã vạch tìm siêu nhanh tại quầy
        ],
      }
    : {};

  // Đếm số sản phẩm khớp lệnh tìm kiếm
  const count = await Product.countDocuments({ ...keyword });

  // Tìm sản phẩm + Đổ đầy dữ liệu bảng danh mục (.populate) để Frontend có tên hiển thị
  const products = await Product.find({ ...keyword })
    .populate('category', 'name') // 👈 Thêm dòng này để bốc luôn tên danh mục ra ngoài
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ updatedAt: -1 });

  console.log(`Tìm thấy ${products.length} sản phẩm khớp lệnh.`);

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

// @desc    Create a product (Đổi giá trị mẫu thành đồ tiện lợi / siêu thị)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // 🎯 BƯỚC 1: Tìm một danh mục bất kỳ có sẵn trong database để làm danh mục gốc mặc định
  let defaultCategory = await Category.findOne();

  // Nếu trong database chưa có bất kỳ danh mục nào, hệ thống tự tạo nhanh một danh mục mặc định
  if (!defaultCategory) {
    defaultCategory = await Category.create({
      name: 'Hàng phổ thông',
      image: 'default-cat.png'
    });
  }

  // 🎯 BƯỚC 2: Gán ID của danh mục mặc định đó vào sản phẩm mẫu mới tạo
  const product = new Product({
    name: 'Sản phẩm mẫu ' + Date.now(),
    price: 0,
    costPrice: 0, // Giá vốn mặc định
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Thương hiệu mẫu',
    category: defaultCategory._id, // 👈 Đã thay bằng ID thật (ObjectId) thay vì chuỗi chữ!
    countInStock: 0,
    numReviews: 0,
    description: 'Mô tả mẫu...',
    unit: 'Cái'
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product (Xóa specs công nghệ, đồng bộ dữ liệu siêu thị mini)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  // 📥 Hứng đúng các trường nghiệp vụ tiện lợi từ Form gửi lên
  const {
    name,
    barcode,
    unit,
    costPrice,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    expiryDate,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.barcode = barcode !== undefined ? barcode : product.barcode;
    product.unit = unit || product.unit;
    product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
    product.price = price !== undefined ? price : product.price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.expiryDate = expiryDate ? new Date(expiryDate) : product.expiryDate; // Chuẩn hóa lưu ngày tháng vào DB

    // ❌ XÓA BỎ HOÀN TOÀN: product.specs = specs (Hệ thống không dùng nữa)

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm cần cập nhật');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Đã xóa sản phẩm thành công' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};