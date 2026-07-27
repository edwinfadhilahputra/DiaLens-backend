const path = require('path');
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');

const app = express();

// ==========================================
// 1. MIDDLEWARE CORS & PARSING
// ==========================================
app.use(cors({
  origin: '*', // Bisa diganti dengan 'https://dia-lens.vercel.app' demi keamanan
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. KONEKSI DATABASE (Dengan Cached Connection)
// ==========================================
const databaseUrl = process.env.MONGO_URI;

// Helper koneksi MongoDB untuk Serverless Function
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(databaseUrl || 'mongodb://127.0.0.1:27017/healthrisk-backend');
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
};

// Middleware untuk memastikan DB terhubung sebelum API diproses
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ==========================================
// 3. ROUTING API
// ==========================================
app.use('/api/health', healthRoutes);

// Rute tes status utama
app.get('/', (req, res) => {
  res.send('🚀 DiaLens Backend Server is Running Smoothly on Vercel!');
});

// ==========================================
// 4. JALANKAN PORT (Lokal saja, ekspor app untuk Vercel)
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
  });
}

module.exports = app;