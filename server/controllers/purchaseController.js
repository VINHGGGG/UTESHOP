import asyncHandler from 'express-async-handler';
import PurchaseOrder from '../models/PurchaseOrder.js'; // Đường dẫn tới file model của cậu
import Product from '../models/ProductModel.js'; // Tham chiếu tới bảng Sản phẩm để cộng kho

// @desc    Tạo phiếu nhập hàng mới và CẬP NHẬT TỰ ĐỘNG SỐ LƯỢNG KHO HÀNG
// @route   POST /api/purchases
// @access  Private/Admin
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier, items, status } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Danh sách mặt hàng nhập kho không được để trống');
  }

  // 1. Tính toán tổng tiền của toàn bộ phiếu nhập hàng
  const totalPrice = items.reduce((acc, item) => {
    return acc + item.qty * item.importPrice;
  }, 0);

  // 2. Khởi tạo đối tượng phiếu nhập hàng
  const purchaseOrder = new PurchaseOrder({
    user: req.user._id, // Lấy ID của nhân viên/thủ kho đang đăng nhập từ middleware protect
    supplier,
    items,
    totalPrice,
    status: status || 'Pending', // Mặc định nếu không truyền là Pending
  });

  // 3. LOGIC XỬ LÝ KHO: Nếu phiếu nhập tạo xong ở trạng thái 'Completed' (Xác nhận vào kho luôn)
  if (purchaseOrder.status === 'Completed') {
    for (const item of purchaseOrder.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // Cộng dồn số lượng nhập vào số lượng tồn kho hiện tại trên hệ thống
        product.countInStock = (product.countInStock || 0) + item.qty;
        
        // (Tùy chọn nâng cao): Cập nhật lại giá vốn nhập vào mới nhất của sản phẩm nếu bảng sản phẩm của cậu có trường này
         if (product.priceImport !== undefined) {
           product.priceImport = item.importPrice;
         }

        await product.save();
      } else {
        res.status(404);
        throw new Error(`Không tìm thấy sản phẩm có ID: ${item.product} để nhập kho`);
      }
    }
  }

  // 4. Lưu phiếu nhập vào cơ sở dữ liệu
  const createdPurchaseOrder = await purchaseOrder.save();
  res.status(201).json(createdPurchaseOrder);
});

// @desc    Lấy danh sách tất cả các phiếu nhập hàng (Phục vụ trang Nhật ký nhập kho)
// @route   GET /api/purchases
// @access  Private/Admin
const getPurchaseOrders = asyncHandler(async (req, res) => {
  // Kết hợp .populate để lôi tên nhân viên (user) và tên nhà cung cấp (supplier) ra hiển thị luôn
  const purchaseOrders = await PurchaseOrder.find({})
    .populate('user', 'name email')
    .populate('supplier', 'name phone')
    .sort({ createdAt: -1 });

  res.json(purchaseOrders);
});

// @desc    Xem chi tiết một phiếu nhập hàng cụ thể
// @route   GET /api/purchases/:id
// @access  Private/Admin
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
    .populate('user', 'name email')
    .populate('supplier', 'name phone address')
    .populate('items.product', 'name image barcode'); // Lấy thêm thông tin ảnh, mã vạch sản phẩm nếu cần

  if (purchaseOrder) {
    res.json(purchaseOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy phiếu nhập hàng này');
  }
});

// @desc    Duyệt phiếu nhập (Chuyển trạng thái từ Pending -> Completed và thực hiện cộng kho)
// @route   PUT /api/purchases/:id/complete
// @access  Private/Admin
const updatePurchaseOrderToComplete = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Không tìm thấy phiếu nhập hàng');
  }

  if (purchaseOrder.status === 'Completed') {
    res.status(400);
    throw new Error('Phiếu nhập hàng này đã được duyệt và vào kho từ trước, không thể duyệt lại');
  }

  // Chuyển trạng thái thành Hoàn thành
  purchaseOrder.status = 'Completed';

  // Tiến hành chạy vòng lặp cộng kho tương tự như lúc tạo
  for (const item of purchaseOrder.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = (product.countInStock || 0) + item.qty;
      await product.save();
    }
  }

  const updatedOrder = await purchaseOrder.save();
  res.json(updatedOrder);
});

export {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderToComplete
};