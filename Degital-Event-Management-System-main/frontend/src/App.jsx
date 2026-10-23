import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteUser from './components/ProtectedRouteUser';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminRegister from './pages/Admin/AdminRegister';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateEvent from './pages/Admin/CreateEvent';
import MyEvents from './pages/Admin/MyEvents';
import Participants from './pages/Admin/Participants';
import Announcements from './pages/Admin/Announcements';

// User Pages
import UserLogin from './pages/User/UserLogin';
import UserRegister from './pages/User/UserRegister';
import Home from './pages/User/Home';
import EventDetail from './pages/User/EventDetail';
import MyRegistrations from './pages/User/MyRegistrations';
import MyAnnouncements from './pages/User/MyAnnouncements';

// Landing Page
import LandingPage from './pages/LandingPage';

// Initialize EmailJS
import { initEmailJS } from './utils/helpers';

// Initialize EmailJS on app load
initEmailJS();

function App() {
  return (
    <AdminAuthProvider>
      <UserAuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRouteAdmin>
                      <AdminDashboard />
                    </ProtectedRouteAdmin>
                  }
                />
                <Route
                  path="/admin/create-event"
                  element={
                    <ProtectedRouteAdmin>
                      <CreateEvent />
                    </ProtectedRouteAdmin>
                  }
                />
                <Route
                  path="/admin/my-events"
                  element={
                    <ProtectedRouteAdmin>
                      <MyEvents />
                    </ProtectedRouteAdmin>
                  }
                />
                <Route
                  path="/admin/participants"
                  element={
                    <ProtectedRouteAdmin>
                      <Participants />
                    </ProtectedRouteAdmin>
                  }
                />
                <Route
                  path="/admin/announcements"
                  element={
                    <ProtectedRouteAdmin>
                      <Announcements />
                    </ProtectedRouteAdmin>
                  }
                />

                {/* User Routes */}
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/events" element={<Home />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route
                  path="/my-registrations"
                  element={
                    <ProtectedRouteUser>
                      <MyRegistrations />
                    </ProtectedRouteUser>
                  }
                />
                <Route
                  path="/my-announcements"
                  element={
                    <ProtectedRouteUser>
                      <MyAnnouncements />
                    </ProtectedRouteUser>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
