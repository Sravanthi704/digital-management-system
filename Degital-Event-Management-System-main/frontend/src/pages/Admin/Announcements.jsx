import { useState, useEffect, useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import api from '../../api/api';
import { sendAnnouncementEmail, sendBatchEmails } from '../../utils/helpers';
import AnnouncementCard from '../../components/AnnouncementCard';

const Announcements = () => {
  const { admin } = useContext(AdminAuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, eventsRes] = await Promise.all([
        api.get('/announcements/admin/my-announcements'),
        api.get('/events/admin/my-events')
      ]);
      setAnnouncements(announcementsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/announcements', formData);
      
      // Send emails to all registered users
      if (response.data.userEmails && response.data.userEmails.length > 0) {
        const selectedEvent = events.find(e => e._id === formData.eventId);
        await sendBatchEmails(
          response.data.userEmails,
          sendAnnouncementEmail,
          selectedEvent?.title || 'Event',
          formData.title,
          formData.message
        );
      }
      
      alert('Announcement created and sent to all participants!');
      setFormData({ eventId: '', title: '', message: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <div className="page-header">
        <h1>Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Create Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="announcement-form-container">
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="form-group">
              <label>Event</label>
              <select
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                required
              >
                <option value="">Select an event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="5"
              />
            </div>
            <button type="submit" className="btn-primary">Send Announcement</button>
          </form>
        </div>
      )}

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <p>No announcements created yet.</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;

