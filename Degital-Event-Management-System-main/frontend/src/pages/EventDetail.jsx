import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvent();
    if (user) {
      checkRegistration();
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await api.get('/registrations', {
        params: { eventId: id }
      });
      const isRegistered = response.data.some(reg => reg.user._id === user._id);
      setRegistered(isRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      await api.post('/registrations', { eventId: id });
      setRegistered(true);
      setMessage('Successfully registered for this event!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setRegistering(false);
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

  if (!event) {
    return (
      <div className="empty-state">
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <div className="event-detail-image">
          {event.image ? (
            <img 
              src={`http://localhost:5000${event.image}`} 
              alt={event.title}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image';
              }}
            />
          ) : (
            <div className="event-detail-placeholder">
              <span>📅</span>
            </div>
          )}
        </div>
        <div className="event-detail-content">
          <span className="event-category-badge">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="event-full-description">{event.description}</p>
          
          <div className="event-detail-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <div>
                <strong>Date</strong>
                <p>{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🕐</span>
              <div>
                <strong>Time</strong>
                <p>{event.time}</p>
              </div>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <div>
                <strong>Location</strong>
                <p>{event.location}</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={registered ? "success-message" : "error-message"}>
              {message}
            </div>
          )}

          {user && (
            <div className="event-action">
              {registered ? (
                <button className="btn-secondary" disabled>
                  ✓ Already Registered
                </button>
              ) : (
                <button 
                  onClick={handleRegister} 
                  className="btn-primary btn-large"
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register for Event'}
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="event-action">
              <p className="login-prompt">Please login to register for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

