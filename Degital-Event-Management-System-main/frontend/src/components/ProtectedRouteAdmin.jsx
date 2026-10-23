import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const ProtectedRouteAdmin = ({ children }) => {
  const { admin, loading } = useContext(AdminAuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRouteAdmin;

