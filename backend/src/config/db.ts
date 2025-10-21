import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_showroom',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Log configuration for debugging
console.log('MySQL Configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password ? '[REDACTED]' : 'No password set',
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: dbConfig.waitForConnections,
    connectionLimit: dbConfig.connectionLimit,
    queueLimit: dbConfig.queueLimit,
});

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// ฟังก์ชันสำหรับทดสอบและ reconnect
const testConnection = async (retryCount = 0, maxRetries = 5) => {
    try {
        const connection = await pool.getConnection();
        console.log('เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');
        connection.release();
    } catch (error: any) {
        console.error('ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL:', error.message);
        if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNREFUSED') {
            if (retryCount < maxRetries) {
                console.log(`การเชื่อมต่อขาดหายหรือถูกปฏิเสธ กำลังพยายาม reconnect ครั้งที่ ${retryCount + 1}/${maxRetries} ใน 5 วินาที...`);
                setTimeout(() => testConnection(retryCount + 1, maxRetries), 5000);
            } else {
                console.error('ถึงจำนวนครั้ง reconnect สูงสุดแล้ว');
                process.exit(1);
            }
        } else {
            console.error('ข้อผิดพลาดฐานข้อมูลร้ายแรง:', error);
            process.exit(1);
        }
    }
};

// เริ่มต้นการทดสอบการเชื่อมต่อ
testConnection();

// เพิ่ม type safety สำหรับ query
export type QueryResult<T = any> = [T[], mysql.FieldPacket[]];

export default pool;