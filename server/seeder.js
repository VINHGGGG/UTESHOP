import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors' 
import User from './models/UserModel.js'
import Product from './models/ProductModel.js'
import Order from './models/OrderModel.js'
import Category from './models/categoryModel.js' 
import connectDB from './config/db.js'

// ==========================================================================
// 1. KHỞI TẠO BỘ DANH MỤC MẪU CHUẨN SIÊU THỊ S-MART
// ==========================================================================
const sampleCategories = [
  { 
    _id: new mongoose.Types.ObjectId(), 
    name: 'Mì ăn liền & Đồ hộp',
    description: 'Các loại mì ly, mì gói, cháo ăn liền và thực phẩm đóng hộp'
  },
  { 
    _id: new mongoose.Types.ObjectId(), 
    name: 'Sữa & Sản phẩm từ sữa',
    description: 'Sữa tươi, sữa hộp, sữa chua và phô mai các loại'
  },
  { 
    _id: new mongoose.Types.ObjectId(), 
    name: 'Nước giải khát & Bia',
    description: 'Nước ngọt lon, nước suối chai, trà xanh và các loại bia'
  },
  { 
    _id: new mongoose.Types.ObjectId(), 
    name: 'Bánh kẹo & Đồ ăn vặt',
    description: 'Bánh que, snack bim bim, kẹo ngậm và hạt sấy khô'
  }
];

// Trích xuất nhanh các ID vừa sinh để gắn liên kết sang cho bảng Products
const [miAnLienId, suaId, nuocGiaiKhatId, banhKeoId] = sampleCategories.map(c => c._id);

// ==========================================================================
// 2. KHỞI TẠO DANH SÁCH SẢN PHẨM MẪU (Đã xào chẻ thêm 30 sản phẩm mới)
// ==========================================================================
const mockProducts = [
  // --------------------------------------------------------------------------
  // NHÓM A: MÌ ĂN LIỀN & ĐỒ HỘP (miAnLienId)
  // --------------------------------------------------------------------------
  {
    name: 'Mì ly Handy Hảo Hảo Tôm Chua Cay 67g',
    image: '/images/haohao_ly.jpg',
    brand: 'Acecook',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 1 - Lô A',
    unit: 'Ly',
    barcode: '8934561230987',
    costPrice: 7200,
    price: 9500,
    countInStock: 85,
  },
  {
    name: 'Mì gói Hảo Hảo Tôm Chua Cay 75g',
    image: '/images/haohao_goi.jpg',
    brand: 'Acecook',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 1 - Lô B',
    unit: 'Gói',
    barcode: '8934561230017',
    costPrice: 3200,
    price: 4500,
    countInStock: 300,
  },
  {
    name: 'Mì Trộn Omachi Sốt Xốt Spaghetti 90g',
    image: '/images/omachi_spaghetti.jpg',
    brand: 'Masan',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 1 - Lô C',
    unit: 'Gói',
    barcode: '8936018619112',
    costPrice: 6800,
    price: 9000,
    countInStock: 120,
  },
  {
    name: 'Mì ly Omachi Xốt Bò Hầm 68g',
    image: '/images/omachi_ly.jpg',
    brand: 'Masan',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 1 - Lô A',
    unit: 'Ly',
    barcode: '8936018610027',
    costPrice: 8500,
    price: 11500,
    countInStock: 90,
  },
  {
    name: 'Mì gói Kokomi Đại 90g Tôm Chua Cay',
    image: '/images/kokomi_90g.jpg',
    brand: 'Masan',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 2 - Lô A',
    unit: 'Gói',
    barcode: '8936018615541',
    costPrice: 2800,
    price: 4000,
    countInStock: 250,
  },
  {
    name: 'Mì xào khô Indomie Mi Goreng vị Đặc Biệt 85g',
    image: '/images/indomie_dacbiet.jpg',
    brand: 'Indomie',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 2 - Lô B',
    unit: 'Gói',
    barcode: '089686043453',
    costPrice: 4000,
    price: 5500,
    countInStock: 180,
  },
  {
    name: 'Phở bò nhớ mãi Mãi Acecook gói 72g',
    image: '/images/pho_nhomai.jpg',
    brand: 'Acecook',
    category: miAnLienId,
    description: 'Kệ đồ khô hàng số 2 - Lô C',
    unit: 'Gói',
    barcode: '8934561631142',
    costPrice: 6200,
    price: 8500,
    countInStock: 70,
  },
  {
    name: 'Cá nục sốt cà chua Ba Cô Gái hộp 155g',
    image: '/images/3cogai_canuc.jpg',
    brand: '3 Cô Gái',
    category: miAnLienId,
    description: 'Kệ thực phẩm đóng hộp tầng trung',
    unit: 'Hộp',
    barcode: '8850389100147',
    costPrice: 14000,
    price: 18500,
    countInStock: 65,
  },
  {
    name: 'Thịt heo hầm đóng hộp Vissan 150g',
    image: '/images/vissan_heoham.jpg',
    brand: 'Vissan',
    category: miAnLienId,
    description: 'Kệ thực phẩm đóng hộp tầng trung',
    unit: 'Hộp',
    barcode: '8934647000127',
    costPrice: 21000,
    price: 27000,
    countInStock: 50,
  },

  // --------------------------------------------------------------------------
  // NHÓM B: SỮA & SẢN PHẨM TỪ SỮA (suaId)
  // --------------------------------------------------------------------------
  {
    name: 'Sữa tươi tiệt trùng Vinamilk ít đường 180ml',
    image: '/images/sua_vinamilk.jpg',
    brand: 'Vinamilk',
    category: suaId,
    description: 'Tủ mát trưng bày tầng 1',
    unit: 'Hộp',
    barcode: '8934673123456',
    costPrice: 6600,
    price: 8500,
    countInStock: 150,
  },
  {
    name: 'Lốc 4 hộp Sữa tươi TH True Milk nguyên chất 180ml',
    image: '/images/th_nguyenchat_180.jpg',
    brand: 'TH True Milk',
    category: suaId,
    description: 'Kệ sữa trung tâm tầng dưới',
    unit: 'Lốc',
    barcode: '8936049050014',
    costPrice: 24500,
    price: 31000,
    countInStock: 80,
  },
  {
    name: 'Sữa tươi tiệt trùng TH True Milk ít đường 110ml',
    image: '/images/th_itduong_110.jpg',
    brand: 'TH True Milk',
    category: suaId,
    description: 'Kệ sữa trẻ em tầng 2',
    unit: 'Hộp',
    barcode: '8936049052216',
    costPrice: 4200,
    price: 5500,
    countInStock: 200,
  },
  {
    name: 'Sữa tiệt trùng Milo lúa mạch Nestlé 180ml',
    image: '/images/milo_180.jpg',
    brand: 'Nestlé',
    category: suaId,
    description: 'Kệ sữa trung tâm tầng 3',
    unit: 'Hộp',
    barcode: '8934804015777',
    costPrice: 7500,
    price: 9800,
    countInStock: 160,
  },
  {
    name: 'Sữa chua ăn Vinamilk có đường hộp 100g',
    image: '/images/suachua_vinamilk.jpg',
    brand: 'Vinamilk',
    category: suaId,
    description: 'Tủ mát trưng bày sữa chua tầng lửng',
    unit: 'Hộp',
    barcode: '8934673561111',
    costPrice: 5500,
    price: 7000,
    countInStock: 100,
  },
  {
    name: 'Sữa chua uống Probi hương Việt Quất 65ml',
    image: '/images/probi_vietquat.jpg',
    brand: 'Vinamilk',
    category: suaId,
    description: 'Tủ mát trưng bày sữa chua tầng lửng',
    unit: 'Chai',
    barcode: '8934673542240',
    costPrice: 4800,
    price: 6300,
    countInStock: 140,
  },
  {
    name: 'Sữa đặc có đường Ông Thọ đỏ lon 380g',
    image: '/images/ongtho_do.jpg',
    brand: 'Vinamilk',
    category: suaId,
    description: 'Kệ sữa đặc và nguyên liệu gia vị',
    unit: 'Lon',
    barcode: '8934673111040',
    costPrice: 20000,
    price: 25000,
    countInStock: 45,
  },
  {
    name: 'Phô mai bò cười hộp 8 miếng 112g',
    image: '/images/phomai_bocuoi.jpg',
    brand: 'Bel',
    category: suaId,
    description: 'Tủ lạnh bảo quản thực phẩm mát',
    unit: 'Hộp',
    barcode: '3073710665977',
    costPrice: 34000,
    price: 43000,
    countInStock: 35,
  },

  // --------------------------------------------------------------------------
  // NHÓM C: NƯỚC GIẢI KHÁT & BIA (nuocGiaiKhatId)
  // --------------------------------------------------------------------------
  {
    name: 'Nước ngọt Coca Cola lon 320ml',
    image: '/images/cocacola.jpg',
    brand: 'Coca-Cola',
    category: nuocGiaiKhatId,
    description: 'Tủ mát trưng bày tầng 2',
    unit: 'Lon',
    barcode: '8934567111222',
    costPrice: 8000,
    price: 11000,
    countInStock: 200,
  },
  {
    name: 'Nước ngọt Pepsi Cola lon 320ml',
    image: '/images/pepsi.jpg',
    brand: 'Pepsi',
    category: nuocGiaiKhatId,
    description: 'Tủ mát trưng bày tầng 2',
    unit: 'Lon',
    barcode: '8934584011110',
    costPrice: 7800,
    price: 10500,
    countInStock: 180,
  },
  {
    name: 'Nước ngọt 7Up vị chanh lon 320ml',
    image: '/images/7up.jpg',
    brand: 'Pepsi',
    category: nuocGiaiKhatId,
    description: 'Tủ mát trưng bày tầng 3',
    unit: 'Lon',
    barcode: '8934584022222',
    costPrice: 7800,
    price: 10500,
    countInStock: 110,
  },
  {
    name: 'Trà xanh không độ chai 450ml',
    image: '/images/traxanh_khongdo.jpg',
    brand: 'Tân Hiệp Phát',
    category: nuocGiaiKhatId,
    description: 'Kệ nước giải khát dãy dọc',
    unit: 'Chai',
    barcode: '8936006121108',
    costPrice: 8200,
    price: 11000,
    countInStock: 130,
  },
  {
    name: 'Trà thanh nhiệt Dr Thanh chai 450ml',
    image: '/images/drthanh.jpg',
    brand: 'Tân Hiệp Phát',
    category: nuocGiaiKhatId,
    description: 'Kệ nước giải khát dãy dọc',
    unit: 'Chai',
    barcode: '8936006122228',
    costPrice: 8500,
    price: 11500,
    countInStock: 95,
  },
  {
    name: 'Nước tăng lực Sting hương dâu chai vát 320ml',
    image: '/images/sting_dau.jpg',
    brand: 'Pepsi',
    category: nuocGiaiKhatId,
    description: 'Tủ mát trưng bày tầng 1',
    unit: 'Chai',
    barcode: '8934584311111',
    costPrice: 8500,
    price: 12000,
    countInStock: 220,
  },
  {
    name: 'Nước khoáng thiên nhiên Aquafina chai 500ml',
    image: '/images/aquafina_500.jpg',
    brand: 'Pepsi',
    category: nuocGiaiKhatId,
    description: 'Tủ mát sát cửa ra vào tầng đáy',
    unit: 'Chai',
    barcode: '8934584611112',
    costPrice: 4000,
    price: 6000,
    countInStock: 340,
  },
  {
    name: 'Nước khoáng thiên nhiên Lavie chai 500ml',
    image: '/images/lavie_500.jpg',
    brand: 'Nestlé',
    category: nuocGiaiKhatId,
    description: 'Tủ mát sát cửa ra vào tầng đáy',
    unit: 'Chai',
    barcode: '8935049500115',
    costPrice: 4200,
    price: 6000,
    countInStock: 280,
  },
  {
    name: 'Bia Heineken Premium Silver lon cao 330ml',
    image: '/images/heineken_silver.jpg',
    brand: 'Heineken',
    category: nuocGiaiKhatId,
    description: 'Kệ đồ uống có cồn góc trong',
    unit: 'Lon',
    barcode: '8934841013330',
    costPrice: 16500,
    price: 22000,
    countInStock: 120,
  },
  {
    name: 'Bia Tiger Crystal lon cao 330ml',
    image: '/images/tiger_crystal.jpg',
    brand: 'Tiger',
    category: nuocGiaiKhatId,
    description: 'Kệ đồ uống có cồn góc trong',
    unit: 'Lon',
    barcode: '8934841913333',
    costPrice: 14000,
    price: 19000,
    countInStock: 150,
  },

  // --------------------------------------------------------------------------
  // NHÓM D: BÁNH KẸO & ĐỒ ĂN VẶT (banhKeoId)
  // --------------------------------------------------------------------------
  {
    name: 'Bánh que Pocky vị dâu hộp 38g',
    image: '/images/pocky_dau.jpg',
    brand: 'Glico',
    category: banhKeoId,
    description: 'Kệ bánh kẹo trung tâm',
    unit: 'Hộp',
    barcode: '4901005511112',
    costPrice: 15500,
    price: 21000,
    countInStock: 40,
  },
  {
    name: 'Snack khoai tây Lay vị Tự Nhiên Classic 56g',
    image: '/images/lays_classic.jpg',
    brand: 'Lay`s',
    category: banhKeoId,
    description: 'Kệ Snack bim bim hàng treo kệ 1',
    unit: 'Gói',
    barcode: '8936079121113',
    costPrice: 9200,
    price: 13000,
    countInStock: 80,
  },
  {
    name: 'Snack khoai tây Lay vị Sườn Nướng BBQ 56g',
    image: '/images/lays_bbq.jpg',
    brand: 'Lay`s',
    category: banhKeoId,
    description: 'Kệ Snack bim bim hàng treo kệ 1',
    unit: 'Gói',
    barcode: '8936079122226',
    costPrice: 9200,
    price: 13000,
    countInStock: 75,
  },
  {
    name: 'Snack bắp ngọt Oishi bắp cay gói 40g',
    image: '/images/oishi_bap.jpg',
    brand: 'Oishi',
    category: banhKeoId,
    description: 'Kệ Snack bim bim treo kệ dưới',
    unit: 'Gói',
    barcode: '8934684011407',
    costPrice: 4200,
    price: 6000,
    countInStock: 110,
  },
  {
    name: 'Bánh Choco-Pie Orion hộp 2 miếng 66g',
    image: '/images/chocopie_2p.jpg',
    brand: 'Orion',
    category: banhKeoId,
    description: 'Kệ bánh kẹo trung tâm tầng 2',
    unit: 'Hộp',
    barcode: '8936036010014',
    costPrice: 8000,
    price: 11500,
    countInStock: 50,
  },
  {
    name: 'Hộp bánh quy bơ Danisa truyền thống 200g',
    image: '/images/danisa_200g.jpg',
    brand: 'Danisa',
    category: banhKeoId,
    description: 'Kệ trưng bày quà tặng / bánh hộp lớn',
    unit: 'Hộp',
    barcode: '8996001301138',
    costPrice: 42000,
    price: 54000,
    countInStock: 25,
  },
  {
    name: 'Kẹo cao su Doublemint hương bạc hà hũ 58g',
    image: '/images/doublemint_hu.jpg',
    brand: 'Wrigley',
    category: banhKeoId,
    description: 'Kệ trưng bày ngay quầy tính tiền',
    unit: 'Hũ',
    barcode: '0022000013627',
    costPrice: 21500,
    price: 28000,
    countInStock: 60,
  },
  {
    name: 'Kẹo dẻo Haribo Goldbears hình gấu hộp gói 80g',
    image: '/images/haribo_gau.jpg',
    brand: 'Haribo',
    category: banhKeoId,
    description: 'Kệ kẹo dẻo kẹo mút trẻ em',
    unit: 'Gói',
    barcode: '4001686301524',
    costPrice: 22000,
    price: 29000,
    countInStock: 45,
  }
];

dotenv.config()
connectDB()

const importData = async () => {
  try {
    // 1. Xóa sạch dữ liệu cũ
    await Order.deleteMany()
    await Product.deleteMany()
    await Category.deleteMany() 

    // Làm mới bộ Index ẩn của Categories để tránh lỗi E11000 trùng tên danh mục
    try {
      await Category.collection.dropIndexes();
    } catch (err) {
      console.log('Làm mới bộ chỉ mục danh mục...'.yellow);
    }

    console.log('🗑️  Đã dọn sạch dữ liệu cũ trong Orders, Products, Categories!'.red.inverse)

    // 2. Nạp mảng danh mục mới vào trước
    await Category.insertMany(sampleCategories)
    console.log('📦 Data Categories Imported!'.cyan.inverse)

    // 3. Lấy Admin User (Người dùng đầu tiên trong DB)
    const createdUsers = await User.find({})
    if (createdUsers.length === 0) {
      console.error('❌ Thất bại: Không tìm thấy User nào trong Database!'.red.bold)
      process.exit(1)
    }
    const adminUser = createdUsers[0]._id

    // 4. Gán Admin User đó cho tất cả sản phẩm
    const sampleProducts = mockProducts.map((product) => {
      return { ...product, user: adminUser }
    })

    // 5. Nạp sản phẩm vào DB
    await Product.insertMany(sampleProducts)

    console.log('🛒 Data Products Imported!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`❌ Lỗi Seeder: ${error}`.red.bold)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await Category.deleteMany() 

    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}