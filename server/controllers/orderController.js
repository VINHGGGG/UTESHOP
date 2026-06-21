import asyncHandler from 'express-async-handler';
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import Product from '../models/ProductModel.js';
import Customer from '../models/CustomerModel.js';
import Shift from '../models/ShiftModel.js';

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    customerId,
    isUsePoints,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('Không có sản phẩm trong đơn hàng');
  } else {

    // ==================================================================
    // 🛡️ BƯỚC 1: KIỂM TRA TỒN KHO (VALIDATION)
    // ==================================================================
    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      
      if (!product) {
        res.status(404);
        throw new Error('Sản phẩm không tồn tại');
      }

      if (item.qty > product.countInStock) {
        res.status(400);
        throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.countInStock} cái, bạn không thể mua ${item.qty} cái.`);
      }
    }

    // ==================================================================
    // 📝 BƯỚC 2: TẠO ĐƠN HÀNG VÀ TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI THANH TOÁN
    // ==================================================================
    
    // 🌟 Kiểm tra: Nếu là đơn bán tại quầy POS (Tiền mặt, Chuyển khoản, Quẹt thẻ...)
    // thì được coi là đã thanh toán ngay lập tức.
    // LƯU Ý: Nếu cậu có phương thức "COD" (Thu hộ) thì KHÔNG được cho isPaid = true lúc tạo đơn
    const isPosOrder = paymentMethod === 'Tiền mặt' || paymentMethod === 'Chuyển khoản' || paymentMethod === 'Quẹt thẻ';

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product || x._id,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      customer: customerId || undefined, 

      // 🌟 THAY ĐỔI TẠI ĐÂY: Gán trạng thái thanh toán tự động
      isPaid: isPosOrder ? true : false,
      paidAt: isPosOrder ? Date.now() : undefined,
    });

    const createdOrder = await order.save();

    if (customerId) {
      const customer = await Customer.findById(customerId);
      
      if (customer) {
        if (isUsePoints && customer.points >= 100) {
          const pointsDiscount = customer.points * 200;

          if (pointsDiscount <= totalPrice) {
            customer.points = 0;
          } else {
            const pointsNeeded = Math.ceil(totalPrice / 200);
            customer.points -= pointsNeeded;
          }
        }

        const pointsEarned = Math.floor(totalPrice / 10000);
        customer.points += pointsEarned;
        customer.totalSpent += totalPrice;

        await customer.save();
      }
    }

    // ==================================================================
    // 📉 BƯỚC 3: TRỪ KHO
    // ==================================================================
    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      if (product) {
        product.countInStock = product.countInStock - item.qty;
        await product.save();
      }
    }

    // ==================================================================
    // 🗄️ BƯỚC 4: CẬP NHẬT DÒNG TIỀN VÀO CA TRỰC ĐANG MỞ
    // ==================================================================
    const activeShift = await Shift.findOne({ user: req.user._id, status: 'Open' });
    
    if (activeShift) {
      if (paymentMethod === 'Tiền mặt' || paymentMethod === 'COD') {
        activeShift.cashSales += totalPrice;
        activeShift.expectedAmount = activeShift.startAmount + activeShift.cashSales;
      } else if (paymentMethod === 'Chuyển khoản') {
        activeShift.transferSales += totalPrice;
      } else if (paymentMethod === 'Quẹt thẻ') {
        activeShift.cardSales += totalPrice;
      }
      
      activeShift.totalSales = activeShift.cashSales + activeShift.transferSales + activeShift.cardSales;
      await activeShift.save();
    }
    
    res.status(201).json(createdOrder);
  }
});

// @desc    Lấy danh sách đơn hàng của TÔI
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// @desc    Lấy đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('customer', 'name phone');

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (User & Admin)
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    if (req.user.isAdmin || order.user.toString() === req.user._id.toString()) {
        
        if (!req.user.isAdmin && order.isDelivered) {
            res.status(400)
            throw new Error('Đơn hàng đã giao, bạn không thể hủy. Vui lòng liên hệ Admin.')
        }

        await order.deleteOne() 
        res.json({ message: 'Đã hủy đơn hàng thành công' })
    } else {
        res.status(401)
        throw new Error('Bạn không có quyền hủy đơn hàng này')
    }
  } else {
    res.status(404)
    throw new Error('Không tìm thấy đơn hàng')
  }
})

// 2. Lấy TẤT CẢ đơn hàng (Dành cho Admin)
// GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .sort({ createdAt: -1 });
    
  res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    // Nếu là COD, khi giao hàng xong thì coi như đã thanh toán
    if (order.paymentMethod === 'COD' || order.paymentMethod === 'Tiền mặt') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    const updatedOrder = await Order.findById(req.params.id).populate('user', 'id name');
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy hóa đơn cần cập nhật');
  }
});

// @desc    Get dashboard stats
// @route   GET /api/orders/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Lấy các chỉ số đếm cơ bản (Giữ nguyên của cậu)
  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();

  const paidOrders = await Order.find({ isPaid: true }).populate('orderItems.product');
  
  const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

  let totalCost = 0;
  paidOrders.forEach((order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => {
        const cost = item.product?.costPrice || 0; 
        totalCost += cost * item.qty;
      });
    }
  });

  const grossProfit = totalSales - totalCost;

  // ==================================================================
  // 📊 BƯỚC THÊM MỚI 1: TÍNH DOANH THU 7 NGÀY GẦN NHẤT (Biểu đồ cột)
  // ==================================================================
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklySalesAgg = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        // Gom nhóm theo định dạng YYYY-MM-DD (múi giờ Việt Nam +7)
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
        doanhThu: { $sum: "$totalPrice" }
      }
    },
    { $sort: { _id: 1 } } // Sắp xếp tăng dần theo ngày từ xa đến gần
  ]);

  const dayLabels = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const weeklySales = weeklySalesAgg.map(item => {
    const dayIndex = new Date(item._id).getDay();
    return {
      name: dayLabels[dayIndex], // Trả về "Thứ 2", "Thứ 3"... hợp gu với Recharts
      doanhThu: item.doanhThu
    };
  });

  // ==================================================================
  // 💳 BƯỚC THÊM MỚI 2: TÍNH % PHƯƠNG THỨC THANH TOÁN (Biểu đồ tròn)
  // ==================================================================
  const totalPaidOrdersCount = await Order.countDocuments({ isPaid: true });
  const paymentAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 }
      }
    }
  ]);

  const paymentStats = paymentAgg.map(item => ({
    name: item._id || 'Khác',
    // Tính toán ra phần trăm tròn số nguyên để hiển thị đẹp mắt trên Pie chart
    value: totalPaidOrdersCount > 0 ? Math.round((item.count / totalPaidOrdersCount) * 100) : 0
  }));

  // ==================================================================
  // 🔥 BƯỚC THÊM MỚI 3: LẤY TOP SẢN PHẨM BÁN CHẠY (Bảng chi tiết bên trái)
  // ==================================================================
  const topProductsAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" }, // Tách mảng sản phẩm trong mỗi đơn hàng ra
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        qtySold: { $sum: "$orderItems.qty" }
      }
    },
    { $sort: { qtySold: -1 } }, // Thằng nào bán nhiều nhất xếp lên đầu
    { $limit: 5 } // Chỉ lấy top 5 sản phẩm nổi bật nhất
  ]);

  const topProducts = topProductsAgg.map(item => ({
    _id: item._id,
    name: item.name,
    qtySold: item.qtySold
  }));

  // ==================================================================
  // ⚡ BƯỚC THÊM MỚI 4: LẤY 5 ĐƠN HÀNG MỚI NHẤT (Bảng chi tiết bên phải)
  // ==================================================================
  const latestOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id totalPrice paymentMethod createdAt');

  // Trả toàn bộ cục data siêu xịn này về cho Frontend hiển thị động hoàn toàn!
  res.json({
    userCount,
    productCount,
    orderCount,
    totalSales,
    totalCost,
    grossProfit,
    weeklySales,  // Biểu đồ cột đọc ở đây
    paymentStats, // Biểu đồ tròn đọc ở đây
    topProducts,  // Bảng top sản phẩm đọc ở đây
    latestOrders  // Bảng đơn hàng mới đọc ở đây
  });
});

// @desc    Xử lý trả hàng
// @route   PUT /api/orders/:id/return
// @access  Private/Admin
const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy hóa đơn này');
  }

  if (order.isReturned) {
    res.status(400);
    throw new Error('Hóa đơn này đã được làm thủ tục trả hàng trước đó rồi!');
  }

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.qty; 
      await product.save();
    }
  }

  if (order.customer) {
    const customer = await Customer.findById(order.customer);
    if (customer) {
      const pointsToDeduct = Math.floor(order.totalPrice / 10000);
      customer.points = Math.max(0, customer.points - pointsToDeduct);
      customer.totalSpent = Math.max(0, customer.totalSpent - order.totalPrice);
      await customer.save();
    }
  }

  const amountToRefund = order.totalPrice; 
  const activeShiftForReturn = await Shift.findOne({ user: req.user._id, status: 'Open' });
  
  if (activeShiftForReturn && amountToRefund > 0) {
    if (order.paymentMethod === 'Tiền mặt' || order.paymentMethod === 'COD') {
      activeShiftForReturn.cashSales = Math.max(0, activeShiftForReturn.cashSales - amountToRefund);
      activeShiftForReturn.expectedAmount = activeShiftForReturn.startAmount + activeShiftForReturn.cashSales;
    } else if (order.paymentMethod === 'Chuyển khoản') {
      activeShiftForReturn.transferSales = Math.max(0, activeShiftForReturn.transferSales - amountToRefund);
    } else if (order.paymentMethod === 'Quẹt thẻ') {
      activeShiftForReturn.cardSales = Math.max(0, activeShiftForReturn.cardSales - amountToRefund);
    }
    activeShiftForReturn.totalSales = activeShiftForReturn.cashSales + activeShiftForReturn.transferSales + activeShiftForReturn.cardSales;
    await activeShiftForReturn.save();
  }

  order.isReturned = true; 
  order.returnedAt = Date.now();
  order.totalPrice = 0; 

  const updatedOrder = await order.save();
  res.status(200).json({ message: 'Đã hoàn tất thủ tục trả hàng, kho đã tự động cộng số dư!', updatedOrder });
});

export { 
  addOrderItems, 
  getMyOrders, 
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  getDashboardStats,
  deleteOrder,
  returnOrder,
};