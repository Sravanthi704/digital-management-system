import { useState, useEffect } from 'react';
import api from '../api/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all events
      const eventsResponse = await api.get('/events');
      const allEvents = eventsResponse.data;
      setEvents(allEvents);
      setStats(prev => ({ ...prev, totalEvents: allEvents.length }));

      // Fetch all registrations to count participants
      const registrationsResponse = await api.get('/registrations');
      const allRegistrations = registrationsResponse.data;
      
      // Count unique registrations per event
      const registrationCounts = {};
      allRegistrations.forEach(reg => {
        const eventId = reg.event._id;
        registrationCounts[eventId] = (registrationCounts[eventId] || 0) + 1;
      });

      // Add registration count to each event
      const eventsWithCounts = allEvents.map(event => ({
        ...event,
        registrationCount: registrationCounts[event._id] || 0
      }));

      setEvents(eventsWithCounts);
      setStats(prev => ({ ...prev, totalRegistrations: allRegistrations.length }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your events and view statistics</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalEvents}</h3>
            <p>Total Events</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalRegistrations}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{events.length > 0 ? (stats.totalRegistrations / stats.totalEvents).toFixed(1) : 0}</h3>
            <p>Avg. Registrations</p>
          </div>
        </div>
      </div>

      <div className="dashboard-events">
        <h2>Events Overview</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events created yet. Create your first event!</p>
          </div>
        ) : (
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Participants</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td><span className="category-badge">{event.category}</span></td>
                    <td>{formatDate(event.date)}</td>
                    <td>
                      <strong className="participant-count">{event.registrationCount}</strong>
                    </td>
                    <td>
                      {new Date(event.date) > new Date() ? (
                        <span className="status-active">Active</span>
                      ) : (
                        <span className="status-past">Past</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

