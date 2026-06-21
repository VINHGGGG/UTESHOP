import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Thường là ID của nhân viên thu ngân đang đăng nhập
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: false },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: false },
    },
    
    paymentMethod: {
      type: String,
      required: true, 
      // Đã nới lỏng enum để chấp nhận cả hình thức 'COD' hoặc các cổng thanh toán khác từ Frontend gửi lên nếu có
      enum: ['Tiền mặt', 'Chuyển khoản', 'Quẹt thẻ', 'COD'], 
    },
    
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    // --- Các trường liên quan đến thành viên tích điểm ---
    isUsePoints: { type: Boolean, default: false },
    
    isPaid: { type: Boolean, required: true, default: false }, 
    paidAt: { type: Date },

    // =========================================================
    // 🚨 2 TRƯỜNG QUAN TRỌNG NHẤT CẬU ĐANG THIẾU - THÊM VÀO ĐÂY
    // =========================================================
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // --- Trường hỗ trợ tính năng Trả Hàng Hoàn Kho ---
    isReturned: { type: Boolean, default: false },
    returnedAt: { type: Date },
  },
  {
    timestamps: true, // Tự động tạo ngày createdAt và updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;