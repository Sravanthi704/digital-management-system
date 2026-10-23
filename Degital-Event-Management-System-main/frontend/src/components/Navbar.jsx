import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { UserAuthContext } from '../context/UserAuthContext';

const Navbar = () => {
  const { admin, logout: logoutAdmin } = useContext(AdminAuthContext);
  const { user, logout: logoutUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (admin) {
      logoutAdmin();
      navigate('/admin/login');
    } else if (user) {
      logoutUser();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo nav-link">
          <h2>EventHub</h2>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/events" className="nav-link">Events</Link>
          
          {admin ? (
            <>
              <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/admin/my-events" className="nav-link">My Events</Link>
              <Link to="/admin/participants" className="nav-link">Participants</Link>
              <Link to="/admin/announcements" className="nav-link">Announcements</Link>
              <span className="nav-user">Admin: {admin.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : user ? (
            <>
              <Link to="/my-registrations" className="nav-link">My Registrations</Link>
              <Link to="/my-announcements" className="nav-link">Announcements</Link>
              <span className="nav-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
              <Link to="/admin/login" className="nav-link">Admin</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
