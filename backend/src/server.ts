import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import contactRoutes from './routes/contactRoutes';
import userRoutes from './routes/userRoutes'; // เพิ่ม import
import reportRoutes from './routes/reportRoutes';
import indexRoutes from './routes/index';
import multer from 'multer';
import path from 'path';
// import WebSocket from 'ws'; // Comment WebSocket ชั่วคราว

dotenv.config();

const app = express();

// ตั้งค่า CORS - ต้องอยู่ก่อน middleware อื่นๆ
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://web-carshowroom-frontend.vercel.app'
    ];
    
    // อนุญาตให้ request ที่ไม่มี origin (เช่น Postman, mobile apps)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware สำหรับ parsing JSON และ URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware สำหรับ static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('เฉพาะไฟล์รูปภาพ (JPEG, JPG, PNG) และ PDF เท่านั้น'));
    }
  },
});

// Middleware สำหรับตรวจสอบข้อผิดพลาดจากการอัปโหลดไฟล์
const checkFileError = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.fileError) {
    res.status(400).json({ message: req.body.fileError });
    return;
  }
  next();
};

// Logging middleware (สำหรับ debug)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes - ปรับไม่ overlap (indexRoutes สำหรับ general/public, authRoutes แยก /api/auth)
app.use('/api', indexRoutes); // /api/cars, /api/reviews, /api/bookings, etc.
app.use('/api/auth', authRoutes); // /api/auth/dashboard, /api/auth/recent-activity
app.use('/api/cars', carRoutes);
app.use('/api/contacts', upload.single('file'), checkFileError, contactRoutes);
app.use('/api/users', userRoutes); // เพิ่ม
app.use('/api/reports', reportRoutes);

// WebSocket - Comment ชั่วคราว (ถ้าต้องการรัน port 8080 แยก)
/*
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  ws.on('close', () => console.log('WebSocket connection closed'));
  // เพิ่ม handler message ถ้าต้องการ
});
*/

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  if (err instanceof multer.MulterError) {
    res.status(400).json({ 
      error: 'File Upload Error',
      message: `เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${err.message}` 
    });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid token or no token provided' 
    });
  } else if (err.message) {
    res.status(err.status || 500).json({ 
      error: err.name || 'Error',
      message: err.message 
    });
  } else {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' 
    });
  }
});

// Dynamic PORT สำหรับ Railway (fallback 5000 ถ้าไม่ตั้ง vars)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('='.repeat(50));
});

export default app;