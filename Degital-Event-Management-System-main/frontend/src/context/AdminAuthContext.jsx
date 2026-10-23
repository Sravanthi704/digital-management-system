import { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on mount
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchAdminProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await api.get('/admin/profile');
      setAdmin(response.data);
    } catch (error) {
      localStorage.removeItem('adminToken');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (adminData, token) => {
    localStorage.setItem('adminToken', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

