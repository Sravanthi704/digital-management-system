import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuthContext } from '../context/UserAuthContext';

const ProtectedRouteUser = ({ children }) => {
  const { user, loading } = useContext(UserAuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteUser;

