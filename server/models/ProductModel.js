import mongoose from 'mongoose';

// Giữ lại hoặc tinh chỉnh cấu trúc Review (Nếu app POS không dùng đánh giá, trường này sẽ để trống)
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // ID của Admin/Nhân viên tạo/cập nhật sản phẩm này
    },
    name: {
      type: String,
      required: true, // Tên sản phẩm (VD: Sữa tươi Vinamilk ít đường 180ml)
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true, // Nhà sản xuất / Nhà cung cấp (VD: Vinamilk, Trung Nguyên...)
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category', // 👈 Khai báo tham chiếu chính xác đến model Category
    },
    description: {
      type: String,
      required: false, // Chuyển thành false để không bắt buộc nhập ghi chú bổ sung
      default: '',
    },
    
    // ================================================================
    // 🛒 ĐÂY LÀ CÁC TRƯỜNG NGHIỆP VỤ BỔ SUNG CHO SIÊU THỊ TIỆN LỢI/POS
    // ================================================================
    barcode: {
      type: String,
      required: false, // Để false đề phòng một số mặt hàng rau củ cân ký chưa gán mã vạch sẵn
      default: '',
      index: true,     // Đánh chỉ mục để quét mã vạch hoặc tìm kiếm "tít tít" siêu nhanh
    },
    unit: {
      type: String,
      required: true,
      default: 'Cái',  // Đơn vị tính (Chai, Lon, Hộp, Gói, Cái...)
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,      // Giá vốn nhập kho (Dùng để tính Lợi Nhuận = Giá bán - Giá vốn)
    },
    expiryDate: {
      type: Date,
      required: false, // Hạn sử dụng của các mặt hàng thực phẩm
    },
    // ================================================================

    price: {
      type: Number,
      required: true,
      default: 0,      // Giá bán lẻ niêm yết xuất cho khách hàng
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,      // Số lượng hàng tồn kho thực tế tại siêu thị
    },

    // Giữ lại các trường này để tương thích với các route/logic cũ nếu cần thiết
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

// --- QUAN TRỌNG: PHẢI LÀ EXPORT DEFAULT ---
export default Product;