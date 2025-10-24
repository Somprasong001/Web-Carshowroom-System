import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import contactRoutes from './routes/contactRoutes';
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import indexRoutes from './routes/index';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();

// ตั้งค่า CORS - รองรับทั้ง Development และ Production
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://web-carshowroom-frontend.vercel.app',  // เก่า (ถ้ายังใช้)
      'https://web-carshowroom-system.vercel.app',   // Vercel domain จริงจาก project
      'https://web-carshowroom-system-production.up.railway.app',  // Backend self (ถ้าต้องการ)
      process.env.FRONTEND_URL,  // Dynamic URL from environment
      '*'  // ชั่วคราวสำหรับ test (ลบใน production เพื่อ security)
    ].filter(Boolean); // ลบค่า undefined/null ออก
    
    console.log(`[CORS] Request from origin: ${origin || 'undefined (e.g., Postman/mobile)'}`);
    
    // อนุญาตให้ request ที่ไม่มี origin (เช่น Postman, mobile apps, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS] Allowed origin: ${origin || 'undefined'}`);
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
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
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Car Showroom API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      cars: '/api/cars',
      contacts: '/api/contacts',
      users: '/api/users',
      reports: '/api/reports'
    }
  });
});

// Routes
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/contacts', upload.single('file'), checkFileError, contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
    suggestion: 'Check API documentation for available endpoints'
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
  } else if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ 
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy' 
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
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
  console.log('='.repeat(50));
});

export default app;