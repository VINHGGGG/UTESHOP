import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true }, // Giữ nguyên field của cậu
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isAdmin: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  isVerified: {
        type: Boolean,
        default: false, // Mặc định chưa xác thực
    },
  verificationToken: {
        type: String,
    },
  resetPasswordToken: String,
  resetPasswordExpire: Date,  
}, { timestamps: true });

// --- PHẦN BỔ SUNG QUAN TRỌNG ---

// 1. Hàm kiểm tra mật khẩu nhập vào có khớp với mật khẩu đã mã hóa không
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. Middleware: Tự động mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function () { 
  // 1. Không truyền tham số 'next' vào function ở trên ^
  
  if (!this.isModified('password')) {
    return; // 2. Chỉ cần return là xong, Mongoose tự hiểu để đi tiếp
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema);
export default User;