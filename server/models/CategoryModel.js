import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Tên danh mục không được trùng
      trim: true,
    },
    // Nếu thích có hình ảnh đại diện cho category thì thêm vào đây
    image: { type: String }, 
    description: { type: String },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;