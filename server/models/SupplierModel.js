import mongoose from 'mongoose';

const supplierSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên nhà cung cấp'],
      trim: true,
    },
    contactName: {
      type: String,
      trim: true, // Tên người đại diện liên hệ (Ví dụ: Anh Hoàng - Sale Pepsi)
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại nhà cung cấp'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ nhà cung cấp'],
    },
    taxCode: {
      type: String,
      trim: true, // Mã số thuế để xuất hóa đơn VAT đầu vào nếu cần
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true, // Trạng thái hợp tác (true = đang cung cấp, false = ngừng nhập)
    },
    note: {
      type: String, // Ghi chú thêm (Ví dụ: Giao hàng vào thứ 3 hàng tuần)
    }
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;