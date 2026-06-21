import mongoose from 'mongoose';

const inventoryCheckSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Người kiểm kho
    checkItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        systemQty: { type: Number, required: true }, // Số lượng máy tính đang báo
        actualQty: { type: Number, required: true }, // Số lượng nhân viên đếm thực tế
        reason: { type: String } // Ví dụ: "Hàng bị móp méo", "Hết hạn sử dụng"
      }
    ],
    note: { type: String } // Ghi chú chung cho đợt kiểm kê
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventoryCheckSchema);
export default Inventory;