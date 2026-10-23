import { useState, useEffect, useContext } from 'react';
import { UserAuthContext } from '../../context/UserAuthContext';
import api from '../../api/api';
import AnnouncementCard from '../../components/AnnouncementCard';

const MyAnnouncements = () => {
  const { user } = useContext(UserAuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/my-announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
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
    <div className="my-announcements-page">
      <div className="page-header">
        <h1>My Announcements</h1>
        <p>Announcements for events you're registered for</p>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          <p>No announcements yet for your registered events.</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAnnouncements;

