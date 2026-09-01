import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_umkm_gowa_2026';

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, umkm: true }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Email atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Email atau password salah.' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name, umkmId: user.umkmId },
      JWT_SECRET,
      { expiresIn }
    );

    // Record activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: `User ${user.name} berhasil login ke dalam sistem.`,
      }
    });

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role.name,
        umkm: user.umkm ? { id: user.umkm.id, name: user.umkm.name, logo: user.umkm.logo } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat login.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, umkm: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role.name,
        umkm: user.umkm ? { id: user.umkm.id, name: user.umkm.name, logo: user.umkm.logo, phone: user.umkm.phone, address: user.umkm.address } : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data profil.' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, photo, password } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { role: true, umkm: true }
    });

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        photo: updatedUser.photo,
        role: updatedUser.role.name,
        umkm: updatedUser.umkm ? { id: updatedUser.umkm.id, name: updatedUser.umkm.name, logo: updatedUser.umkm.logo } : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
};

export const register = async (req, res) => {
  const { name, email, password, umkmName, address, phone } = req.body;

  try {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.' });
    }

    // 2. Pastikan role PEMILIK tersedia
    let pemilikRole = await prisma.role.findUnique({
      where: { name: 'PEMILIK' }
    });

    if (!pemilikRole) {
      pemilikRole = await prisma.role.create({
        data: { name: 'PEMILIK' }
      });
    }

    // 3. Buat UMKM baru
    const newUmkm = await prisma.umkm.create({
      data: {
        name: umkmName,
        address: address || null,
        phone: phone || null,
        logo: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=150&auto=format&fit=crop&q=80',
      }
    });

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Buat User baru yang terhubung ke UMKM dan role PEMILIK
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: pemilikRole.id,
        umkmId: newUmkm.id,
        photo: newUmkm.logo,
      },
      include: { role: true, umkm: true }
    });

    // 6. Buat JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role.name, umkmId: newUser.umkmId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 7. Catat Activity Log
    await prisma.activityLog.create({
      data: {
        userId: newUser.id,
        action: 'REGISTER_STORE',
        description: `Pemilik ${newUser.name} mendaftarkan UMKM toko baru: ${newUmkm.name}.`,
      }
    });

    return res.status(201).json({
      success: true,
      message: `Toko "${newUmkm.name}" dan Akun Pemilik berhasil terdaftar!`,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        photo: newUser.photo,
        role: newUser.role.name,
        umkm: { id: newUmkm.id, name: newUmkm.name, logo: newUmkm.logo, address: newUmkm.address, phone: newUmkm.phone }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat mendaftarkan toko baru.' });
  }
};

