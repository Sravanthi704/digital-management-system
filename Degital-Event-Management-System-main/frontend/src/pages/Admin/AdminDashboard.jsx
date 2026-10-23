import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import api from '../../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import ChartCard from '../../components/ChartCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = () => {
  const { admin } = useContext(AdminAuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!analytics) {
    return <div className="empty-state">Failed to load analytics</div>;
  }

  // Chart data for paid vs free events
  const paidVsFreeData = {
    labels: ['Paid Events', 'Free Events'],
    datasets: [{
      data: [analytics.paidEvents, analytics.freeEvents],
      backgroundColor: ['#6366f1', '#10b981'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Chart data for top events by participants
  const topEventsData = {
    labels: analytics.topEvents.map(e => e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title),
    datasets: [{
      label: 'Participants',
      data: analytics.topEvents.map(e => e.participants),
      backgroundColor: '#6366f1',
      borderRadius: 8
    }]
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {admin?.name}</p>
      </div>

      <div className="dashboard-stats">
        <ChartCard
          title="Total Events"
          value={analytics.totalEvents}
          icon="📅"
        />
        <ChartCard
          title="Total Participants"
          value={analytics.totalParticipants}
          icon="👥"
        />
        <ChartCard
          title="Paid Events"
          value={analytics.paidEvents}
          icon="💰"
        />
        <ChartCard
          title="Free Events"
          value={analytics.freeEvents}
          icon="🆓"
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Paid vs Free Events</h3>
          <Doughnut data={paidVsFreeData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        <div className="chart-container">
          <h3>Top Events by Participants</h3>
          <Bar 
            data={topEventsData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/admin/create-event" className="btn-primary">Create New Event</Link>
        <Link to="/admin/my-events" className="btn-secondary">View My Events</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

