import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="event-card">
      <div className="event-card-image">
        {event.image ? (
          <img 
            src={`http://localhost:5000${event.image}`} 
            alt={event.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x250?text=Event+Image';
            }}
          />
        ) : (
          <div className="event-placeholder">
            <span>📅</span>
          </div>
        )}
      </div>
      <div className="event-card-content">
        <span className="event-category">{event.category}</span>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description.substring(0, 100)}...</p>
        <div className="event-meta">
          <span className="event-date">📅 {formatDate(event.date)}</span>
          <span className="event-time">🕐 {event.time}</span>
          <span className="event-location">📍 {event.location}</span>
        </div>
        <Link to={`/events/${event._id}`} className="btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;

