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
    if (user?.umkm?.id) {
      const isPemilikRole = user?.role === 'PEMILIK' || user?.role?.name === 'PEMILIK';
      if (isPemilikRole && activeUmkmId !== user.umkm.id) {
        switchUmkm(user.umkm.id);
      } else if (!activeUmkmId) {
        switchUmkm(user.umkm.id);
      }
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

  const registerStore = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
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
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }

      // Mock Fallback jika server backend belum merespons
      const mockId = Date.now();
      const mockUmkm = {
        id: mockId,
        name: formData.umkmName,
        logo: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=150&auto=format&fit=crop&q=80',
        address: formData.address || 'Kabupaten Gowa',
        phone: formData.phone || '-'
      };
      const mockUser = {
        id: mockId + 1,
        name: formData.name,
        email: formData.email,
        role: 'PEMILIK',
        photo: mockUmkm.logo,
        umkm: mockUmkm,
      };
      const mockToken = `mock_jwt_pemilik_token_${mockId}`;
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      switchUmkm(mockUmkm.id);
      return { success: true, message: `Pendaftaran Toko "${formData.umkmName}" Berhasil (Simulasi Mode)` };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      if (token && !token.startsWith('mock_jwt_')) {
        const res = await api.put('/auth/profile', updatedData);
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          return { success: true, message: res.data.message };
        }
      }
    } catch (err) {
      console.warn('API update profile error, fallback to local state update:', err);
    }

    // Fallback update local state
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
    return { success: true, message: 'Profil berhasil diperbarui.' };
  };

  const updateUmkmData = async (umkmId, updatedUmkm) => {
    try {
      if (token && !token.startsWith('mock_jwt_') && umkmId) {
        const res = await api.put(`/umkms/${umkmId}`, updatedUmkm);
        if (res.data.success) {
          setUser(prev => {
            if (!prev) return prev;
            const newUser = {
              ...prev,
              umkm: prev.umkm?.id === Number(umkmId) ? { ...prev.umkm, ...updatedUmkm } : prev.umkm
            };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
          });
          return { success: true, message: res.data.message };
        }
      }
    } catch (err) {
      console.warn('API update UMKM error, fallback to local state update:', err);
    }

    // Fallback update local state for mock
    setUser(prev => {
      if (!prev) return prev;
      const newUser = {
        ...prev,
        umkm: prev.umkm ? { ...prev.umkm, ...updatedUmkm } : { id: umkmId, ...updatedUmkm }
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });

    const mockIndex = INITIAL_MOCK_DATA.umkms.findIndex(u => u.id === Number(umkmId));
    if (mockIndex !== -1) {
      INITIAL_MOCK_DATA.umkms[mockIndex] = { ...INITIAL_MOCK_DATA.umkms[mockIndex], ...updatedUmkm };
    }

    return { success: true, message: 'Data UMKM berhasil diperbarui.' };
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      registerStore,
      updateUserProfile,
      updateUmkmData,
      activeUmkmId,
      switchUmkm,
      isAdmin: user?.role === 'ADMIN' || user?.role?.name === 'ADMIN',
      isPemilik: user?.role === 'PEMILIK' || user?.role?.name === 'PEMILIK',
    }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);
