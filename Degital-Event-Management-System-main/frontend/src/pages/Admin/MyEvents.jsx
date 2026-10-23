import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import api from '../../api/api';
import { sendEventStartEmail, sendBatchEmails } from '../../utils/helpers';

const MyEvents = () => {
  const { admin } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/admin/my-events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to start this event? This will notify all registered participants.')) {
      return;
    }

    try {
      const response = await api.put(`/events/${eventId}/start`);
      
      // Send emails to all paid users
      if (response.data.userEmails && response.data.userEmails.length > 0) {
        await sendBatchEmails(
          response.data.userEmails,
          sendEventStartEmail,
          response.data.event.title
        );
      }
      
      alert('Event started! All participants have been notified.');
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start event');
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      await api.put(`/events/${eventId}/cancel`);
      alert('Event cancelled successfully');
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      alert('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete event');
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
    <div className="my-events-page">
      <div className="page-header">
        <h1>My Events</h1>
        <Link to="/admin/create-event" className="btn-primary">Create New Event</Link>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any events yet.</p>
          <Link to="/admin/create-event" className="btn-primary">Create Your First Event</Link>
        </div>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div key={event._id} className="event-management-card">
              <div className="event-card-content">
                <h3>{event.title}</h3>
                <div className="event-info">
                  <span className={`status-badge status-${event.status}`}>{event.status}</span>
                  <span>{formatDate(event.date)}</span>
                  <span>{event.bookedSeats} / {event.maxSeats} seats</span>
                  {event.isPaid && <span className="badge-paid">${event.price}</span>}
                </div>
              </div>
              <div className="event-actions">
                <Link to={`/events/${event._id}`} className="btn-secondary">View</Link>
                <button
                  onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                {event.status === 'upcoming' && (
                  <button
                    onClick={() => handleStartEvent(event._id)}
                    className="btn-primary"
                  >
                    Start Event
                  </button>
                )}
                {event.status !== 'completed' && event.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelEvent(event._id)}
                    className="btn-danger"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;

