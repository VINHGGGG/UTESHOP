import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true }, // Đánh index để tìm kiếm SĐT siêu nhanh
    points: { type: Number, default: 0 }, // Điểm tích lũy hiện tại
    totalSpent: { type: Number, default: 0 }, // Tổng tiền khách đã mua từ trước đến nay
    rank: { 
      type: String, 
      default: 'Thành viên', 
      enum: ['Thành viên', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Đồng', 'Bạc', 'Vàng', 'Bạch Kim'], 
    }
  },
  { timestamps: true }
);

// 🌟 SỬA TẠI ĐÂY: Bỏ hoàn toàn 'next' đi vì hàm của mình là hàm đồng bộ (Synchronous)
customerSchema.pre('validate', function () {
  if (this.totalSpent >= 50000000) this.rank = 'Bạch Kim';      // Trên 50 triệu
  else if (this.totalSpent >= 20000000) this.rank = 'Vàng';       // Trên 20 triệu
  else if (this.totalSpent >= 5000000) this.rank = 'Bạc';         // Trên 5 triệu
  else if (this.totalSpent >= 1000000) this.rank = 'Đồng';        // Trên 1 triệu
  else this.rank = 'Thành viên';
  
  // KHÔNG CẦN gọi next() nữa cậu nha!
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;