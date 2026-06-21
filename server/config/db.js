import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Thử kết nối
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ Hẹ Hẹ Hẹ :))) MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    // Nếu lỗi thì in ra và thoát chương trình
    console.error(`❌ Huhu :((( Lỗi kết nối MongoDB ùi: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;