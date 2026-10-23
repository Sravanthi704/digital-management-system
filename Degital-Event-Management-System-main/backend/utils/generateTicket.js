/**
 * Generate a unique 10-character alphanumeric ticket code
 * @returns {String} Random ticket code
 */
const generateTicket = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ticketCode = '';
  
  for (let i = 0; i < 10; i++) {
    ticketCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return ticketCode;
};

module.exports = generateTicket;

