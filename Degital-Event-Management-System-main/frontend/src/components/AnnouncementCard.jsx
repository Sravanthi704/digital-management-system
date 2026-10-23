const AnnouncementCard = ({ announcement }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="announcement-card">
      <div className="announcement-header">
        <h3>{announcement.title}</h3>
        <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
      </div>
      <div className="announcement-body">
        <p>{announcement.message}</p>
      </div>
      {announcement.event && (
        <div className="announcement-event">
          <strong>Event:</strong> {announcement.event.title}
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;

