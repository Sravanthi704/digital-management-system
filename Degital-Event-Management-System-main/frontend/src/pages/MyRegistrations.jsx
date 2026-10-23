import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/registrations');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      try {
        await api.delete(`/registrations/${registrationId}`);
        setRegistrations(registrations.filter(reg => reg._id !== registrationId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel registration');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="registrations-page">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>View and manage your event registrations</p>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div className="registrations-list">
          {registrations.map(registration => (
            <div key={registration._id} className="registration-card">
              <div className="registration-content">
                {registration.event.image && (
                  <div className="registration-image">
                    <img 
                      src={`http://localhost:5000${registration.event.image}`} 
                      alt={registration.event.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=Event';
                      }}
                    />
                  </div>
                )}
                <div className="registration-details">
                  <Link to={`/events/${registration.event._id}`}>
                    <h3>{registration.event.title}</h3>
                  </Link>
                  <span className="event-category">{registration.event.category}</span>
                  <div className="registration-meta">
                    <span>📅 {formatDate(registration.event.date)}</span>
                    <span>🕐 {registration.event.time}</span>
                    <span>📍 {registration.event.location}</span>
                  </div>
                  <p className="registration-date">
                    Registered on {formatDate(registration.createdAt)}
                  </p>
                </div>
              </div>
              <div className="registration-actions">
                <Link to={`/events/${registration.event._id}`} className="btn-secondary">
                  View Event
                </Link>
                <button
                  onClick={() => handleCancelRegistration(registration._id)}
                  className="btn-danger"
                >
                  Cancel Registration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;

