import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAuthContext } from '../../context/UserAuthContext';
import api from '../../api/api';
import { sendRegistrationEmail } from '../../utils/helpers';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserAuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registration, setRegistration] = useState(null);
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
      const response = await api.get('/registrations/my-registrations');
      const myReg = response.data.find(reg => reg.event._id === id);
      setRegistration(myReg);
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
      const response = await api.post('/registrations', { eventId: id });
      setRegistration(response.data.registration);
      
      // Send email if free event (paid immediately) or for paid event confirmation
      if (!event.isPaid || response.data.registration.paymentStatus === 'paid') {
        await sendRegistrationEmail(
          response.data.userEmail,
          response.data.userName,
          event.title,
          response.data.registration.ticketCode,
          event.isPaid
        );
      }
      
      setMessage(event.isPaid 
        ? 'Registration successful! Please confirm payment to receive your ticket.'
        : 'Successfully registered for this event!'
      );
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!registration) return;

    setRegistering(true);
    setMessage('');

    try {
      const response = await api.put(`/registrations/${registration._id}/confirm-payment`);
      setRegistration(response.data.registration);
      
      // Send payment confirmation email
      await sendRegistrationEmail(
        response.data.userEmail,
        response.data.userName,
        event.title,
        response.data.registration.ticketCode,
        true
      );
      
      setMessage('Payment confirmed! Your ticket has been sent to your email.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to confirm payment.');
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

  const isRegistered = !!registration;
  const isPaid = registration?.paymentStatus === 'paid';
  const seatsAvailable = event.maxSeats - event.bookedSeats;

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <div className="event-detail-image">
          {event.image ? (
            <img 
              src={event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image}`} 
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <span className="event-category-badge">{event.category}</span>
            {event.isPaid && <span className="badge-paid">💰 Paid Event</span>}
            {!event.isPaid && <span className="badge-free">🆓 Free Event</span>}
            <span className={`status-badge status-${event.status}`}>{event.status}</span>
          </div>
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
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <div>
                <strong>Seats</strong>
                <p>{seatsAvailable} available / {event.maxSeats} total</p>
              </div>
            </div>
          </div>

          {event.isPaid && (
            <div className="price-section">
              <strong>Price: ${event.price}</strong>
            </div>
          )}

          {message && (
            <div className={message.includes('Success') || message.includes('confirmed') ? "success-message" : "error-message"}>
              {message}
            </div>
          )}

          {isRegistered && isPaid && registration.ticketCode && (
            <div className="ticket-section">
              <h3>Your Ticket</h3>
              <div className="ticket-code">
                <strong>Ticket Code:</strong> {registration.ticketCode}
              </div>
            </div>
          )}

          {user && (
            <div className="event-action">
              {!isRegistered ? (
                <button 
                  onClick={handleRegister} 
                  className="btn-primary btn-large"
                  disabled={registering || seatsAvailable === 0}
                >
                  {registering ? 'Registering...' : seatsAvailable === 0 ? 'Event Full' : `Register ${event.isPaid ? `($${event.price})` : '(Free)'}`}
                </button>
              ) : !isPaid && event.isPaid ? (
                <button 
                  onClick={handleConfirmPayment} 
                  className="btn-primary btn-large"
                  disabled={registering}
                >
                  {registering ? 'Processing...' : `Confirm Payment ($${event.price})`}
                </button>
              ) : (
                <button className="btn-secondary" disabled>
                  ✓ Registered {isPaid && '& Paid'}
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

