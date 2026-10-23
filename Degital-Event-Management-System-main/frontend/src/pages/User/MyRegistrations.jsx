import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserAuthContext } from '../../context/UserAuthContext';
import api from '../../api/api';
import { sendPaymentEmail } from '../../utils/helpers';

const MyRegistrations = () => {
  const { user } = useContext(UserAuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/registrations/my-registrations');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (registrationId) => {
    setProcessingPayment(registrationId);
    try {
      const response = await api.put(`/registrations/${registrationId}/confirm-payment`);
      
      // Send payment confirmation email
      await sendPaymentEmail(
        response.data.userEmail,
        response.data.userName,
        response.data.registration.event.title,
        response.data.registration.ticketCode
      );
      
      // Update local state
      setRegistrations(registrations.map(reg => 
        reg._id === registrationId ? response.data.registration : reg
      ));
      alert('Payment confirmed! Your ticket has been sent to your email.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setProcessingPayment(null);
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

  // Only show paid registrations with tickets
  const paidRegistrations = registrations.filter(reg => reg.paymentStatus === 'paid' && reg.ticketCode);
  const unpaidRegistrations = registrations.filter(reg => reg.paymentStatus === 'unpaid');

  return (
    <div className="registrations-page">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>View and manage your event registrations</p>
      </div>

      {unpaidRegistrations.length > 0 && (
        <div className="registrations-section">
          <h2>Pending Payment</h2>
          <div className="registrations-list">
            {unpaidRegistrations.map(registration => (
              <div key={registration._id} className="registration-card">
                <div className="registration-content">
                  {registration.event.image && (
                    <div className="registration-image">
                      <img 
                        src={registration.event.image.startsWith('http') ? registration.event.image : `http://localhost:5000${registration.event.image}`} 
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
                    <p className="price-info">Price: ${registration.event.price}</p>
                  </div>
                </div>
                <div className="registration-actions">
                  <button
                    onClick={() => handleConfirmPayment(registration._id)}
                    className="btn-primary"
                    disabled={processingPayment === registration._id}
                  >
                    {processingPayment === registration._id ? 'Processing...' : `Confirm Payment ($${registration.event.price})`}
                  </button>
                  <button
                    onClick={() => handleCancelRegistration(registration._id)}
                    className="btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paidRegistrations.length === 0 && unpaidRegistrations.length === 0 ? (
        <div className="empty-state">
          <p>You haven't registered for any events yet.</p>
          <Link to="/" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div className="registrations-section">
          <h2>My Tickets</h2>
          <div className="registrations-list">
            {paidRegistrations.map(registration => (
              <div key={registration._id} className="registration-card ticket-card">
                <div className="registration-content">
                  {registration.event.image && (
                    <div className="registration-image">
                      <img 
                        src={registration.event.image.startsWith('http') ? registration.event.image : `http://localhost:5000${registration.event.image}`} 
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
                    <div className="ticket-code-display">
                      <strong>Ticket Code:</strong>
                      <span className="ticket-code-value">{registration.ticketCode}</span>
                    </div>
                  </div>
                </div>
                <div className="registration-actions">
                  <Link to={`/events/${registration.event._id}`} className="btn-secondary">
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;

