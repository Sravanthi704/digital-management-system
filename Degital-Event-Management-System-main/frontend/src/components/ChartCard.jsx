const ChartCard = ({ title, value, icon }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-icon">{icon}</div>
      <div className="chart-card-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
};

export default ChartCard;

