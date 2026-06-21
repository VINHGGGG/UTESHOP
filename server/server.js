import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Nhớ có .js
import productRoutes from './routes/productRoutes.js'; // Nhớ có .js
import userRoutes from './routes/userRoutes.js'; // Nhớ có .js
import couponRoutes from './routes/couponRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; // Import
import purchaseRoutes from './routes/purchaseRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import path from 'path'

dotenv.config();
connectDB();

const app = express();

// Cho phép nhận JSON từ body (để đọc req.body khi login/register)
app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes); // Khai báo route
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/shifts', shiftRoutes);

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));