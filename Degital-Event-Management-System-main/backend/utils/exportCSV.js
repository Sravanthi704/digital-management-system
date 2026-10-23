/**
 * Export registrations data to CSV format
 * @param {Array} registrations - Array of registration objects
 * @returns {String} CSV formatted string
 */
const exportCSV = (registrations) => {
  // CSV header
  let csv = 'User Name,User Email,Event Title,Payment Status,Ticket Code,Registration Date\n';
  
  // CSV rows
  registrations.forEach(reg => {
    const userName = reg.user?.name || 'N/A';
    const userEmail = reg.user?.email || 'N/A';
    const eventTitle = reg.event?.title || 'N/A';
    const paymentStatus = reg.paymentStatus || 'N/A';
    const ticketCode = reg.ticketCode || 'N/A';
    const date = new Date(reg.createdAt).toLocaleDateString();
    
    csv += `"${userName}","${userEmail}","${eventTitle}","${paymentStatus}","${ticketCode}","${date}"\n`;
  });
  
  return csv;
};

module.exports = exportCSV;

