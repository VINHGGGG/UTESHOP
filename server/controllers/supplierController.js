import asyncHandler from 'express-async-handler'; // Hoặc tự dùng try-catch nếu dự án của cậu dùng thế nhé
import Supplier from '../models/SupplierModel.js';

// @desc    Tạo nhà cung cấp mới
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = asyncHandler(async (req, res) => {
  const { name, contactName, phone, email, address, taxCode, note } = req.body;

  // Kiểm tra xem số điện thoại nhà cung cấp này đã tồn tại chưa để tránh trùng lặp
  const supplierExists = await Supplier.findOne({ phone });

  if (supplierExists) {
    res.status(400);
    throw new Error('Số điện thoại nhà cung cấp này đã tồn tại trong hệ thống');
  }

  const supplier = await Supplier.create({
    name,
    contactName,
    phone,
    email,
    address,
    taxCode,
    note,
  });

  if (supplier) {
    res.status(201).json(supplier);
  } else {
    res.status(400);
    throw new Error('Dữ liệu nhà cung cấp không hợp lệ');
  }
});

// @desc    Lấy toàn bộ danh sách nhà cung cấp (Dùng đổ vào Dropdown khi tạo phiếu nhập)
// @route   GET /api/suppliers
// @access  Private/Admin
const getSuppliers = asyncHandler(async (req, res) => {
  // Chỉ lấy những nhà cung cấp đang hoạt động (isActive: true)
  const suppliers = await Supplier.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(suppliers);
});

// @desc    Cập nhật thông tin nhà cung cấp hoặc ngừng hợp tác (isActive = false)
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.contactName = req.body.contactName || supplier.contactName;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.email = req.body.email || supplier.email;
    supplier.address = req.body.address || supplier.address;
    supplier.taxCode = req.body.taxCode || supplier.taxCode;
    supplier.note = req.body.note || supplier.note;
    
    // Nếu truyền trạng thái active (ví dụ muốn tạm ẩn nhà cung cấp này đi)
    if (req.body.isActive !== undefined) {
      supplier.isActive = req.body.isActive;
    }

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy nhà cung cấp này');
  }
});

export { createSupplier, getSuppliers, updateSupplier };