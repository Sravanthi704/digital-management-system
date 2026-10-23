import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';

const Participants = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchParticipants();
    }
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      const [regResponse, eventResponse] = await Promise.all([
        api.get(`/registrations/event/${eventId}`),
        api.get(`/events/${eventId}`)
      ]);
      setRegistrations(regResponse.data);
      setEvent(eventResponse.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/registrations/event/${eventId}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations-${event?.title}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV');
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
    <div className="participants-page">
      <div className="page-header">
        <h1>Participants - {event?.title}</h1>
        <button onClick={handleExportCSV} className="btn-primary">Export CSV</button>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <p>No participants registered for this event yet.</p>
        </div>
      ) : (
        <div className="participants-table-container">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Payment Status</th>
                <th>Ticket Code</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg._id}>
                  <td>{reg.user?.name}</td>
                  <td>{reg.user?.email}</td>
                  <td>{reg.user?.location}</td>
                  <td>
                    <span className={`payment-status ${reg.paymentStatus}`}>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td>{reg.ticketCode || 'N/A'}</td>
                  <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Participants;

