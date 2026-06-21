import mongoose from 'mongoose';

const purchaseOrderSchema = mongoose.Schema(
  {
    // Nhân viên / Thủ kho thực hiện nhập hàng
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User' 
    }, 
    
    // 🎯 THAY ĐỔI: Liên kết ID trực tiếp sang bảng Supplier (Nhà cung cấp)
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Vui lòng cung cấp ID của nhà cung cấp'],
      ref: 'Supplier'
    },
    
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          required: true, 
          ref: 'Product' 
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },          // Số lượng nhập đợt này
        importPrice: { type: Number, required: true }    // Giá vốn nhập vào của mặt hàng này
      }
    ],
    totalPrice: { type: Number, required: true, default: 0.0 },   // Tổng tiền trả nhà cung cấp
    status: { 
      type: String, 
      required: true, 
      default: 'Pending', // Các trạng thái: Pending (Chờ duyệt) -> Completed (Đã vào kho) -> Cancelled (Hủy)
    }, 
  },
  { timestamps: true }
);

// 🎯 FIX LỖI TYPO: Đổi categorySchema thành purchaseOrderSchema và đặt tên Model rõ ràng
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;