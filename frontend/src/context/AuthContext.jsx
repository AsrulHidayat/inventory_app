import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { INITIAL_MOCK_DATA } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeUmkmId, setActiveUmkmId] = useState(() => {
    const saved = localStorage.getItem('activeUmkmId');
    return saved ? Number(saved) : (user?.umkm?.id || null);
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.umkm?.id && !activeUmkmId) {
      setActiveUmkmId(user.umkm.id);
    }
  }, [user]);

  const switchUmkm = (umkmId) => {
    const id = umkmId ? Number(umkmId) : null;
    setActiveUmkmId(id);
    if (id) {
      localStorage.setItem('activeUmkmId', id);
    } else {
      localStorage.removeItem('activeUmkmId');
    }
  };

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      // Coba panggil backend API
      const res = await api.post('/auth/login', { email, password, rememberMe });
      if (res.data.success) {
        const { token: jwtToken, user: userData } = res.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.umkm?.id) {
          switchUmkm(userData.umkm.id);
        }
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      // Mock Fallback Login jika backend belum terkoneksi
      if (email === 'admin@gowa.com' && password === 'admin123') {
        const mockUser = {
          id: 1,
          name: 'Admin Utama Gowa',
          email: 'admin@gowa.com',
          role: 'ADMIN',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          umkm: null,
        };
        const mockToken = 'mock_jwt_admin_token_2026';
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        switchUmkm(null);
        return { success: true, message: 'Login Admin Berhasil (Simulasi Mode)' };
      }

      if (email === 'hr@tokokue.com' || email === 'helda@cireng.com' || email === 'nanda@risol.com') {
        const selectedUmkm = INITIAL_MOCK_DATA.umkms.find(u => 
          (email.includes('hr') && u.id === 1) ||
          (email.includes('helda') && u.id === 2) ||
          (email.includes('nanda') && u.id === 3)
        );
        const mockUser = {
          id: selectedUmkm.id + 1,
          name: `Pemilik ${selectedUmkm.name}`,
          email,
          role: 'PEMILIK',
          photo: selectedUmkm.logo,
          umkm: selectedUmkm,
        };
        const mockToken = `mock_jwt_pemilik_token_${selectedUmkm.id}`;
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        switchUmkm(selectedUmkm.id);
        return { success: true, message: `Login ${selectedUmkm.name} Berhasil` };
      }

      return {
        success: false,
        message: err.response?.data?.message || 'Email atau password salah! Gunakan: admin@gowa.com / admin123'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveUmkmId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeUmkmId');
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUserProfile,
      activeUmkmId,
      switchUmkm,
      isAdmin: user?.role === 'ADMIN',
      isPemilik: user?.role === 'PEMILIK',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
