import mongoose from 'mongoose';

const shiftSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Thu ngân thực hiện ca trực
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    // --- Số dư đầu ca ---
    startAmount: {
      type: Number,
      required: true,
      default: 0, // Tiền mồi, tiền lẻ để trả lại khách trong két
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    // --- Số dư cuối ca ---
    endAmountReal: {
      type: Number,
      default: 0, // Tiền mặt thực tế thu ngân đếm được trong két khi chốt ca
    },
    closedAt: {
      type: Date,
    },
    // --- Hệ thống tự động tính toán từ các hóa đơn trong ca ---
    cashSales: { type: Number, default: 0 },       // Tổng tiền mặt thu từ khách
    transferSales: { type: Number, default: 0 },   // Tổng chuyển khoản thu từ khách
    cardSales: { type: Number, default: 0 },       // Tổng quẹt thẻ thu từ khách
    totalSales: { type: Number, default: 0 },      // Tổng doanh thu hệ thống (Chưa tính tiền mồi đầu ca)
    
    expectedAmount: { type: Number, default: 0 },  // Tiền mặt lý thuyết phải có trong két (= startAmount + cashSales)
    difference: { type: Number, default: 0 },      // Chênh lệch thừa/thiếu (= endAmountReal - expectedAmount)
    
    note: {
      type: String, // Lý do nếu két bị hụt tiền hoặc ghi chú thêm
    },
  },
  {
    timestamps: true,
  }
);

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;