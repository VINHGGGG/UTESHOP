import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, uppercase: true }, // Tên mã (VD: SALE50)
    expiry: { type: Date, required: true }, // Ngày hết hạn
    discount: { type: Number, required: true }, // Số % giảm giá (VD: 10, 20)
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;