import emailjs from 'emailjs-com';

/**
 * Initialize EmailJS (call this once in App.jsx or main.jsx)
 */
export const initEmailJS = () => {
  if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }
};

/**
 * Send registration confirmation email
 */
export const sendRegistrationEmail = async (userEmail, userName, eventTitle, ticketCode, isPaid) => {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured');
    return;
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        to_name: userName,
        event_title: eventTitle,
        ticket_code: ticketCode || 'N/A',
        message: isPaid
          ? `You have successfully registered for ${eventTitle}. Please confirm your payment to receive your ticket.`
          : `You have successfully registered for ${eventTitle}. Your ticket code is: ${ticketCode}`
      }
    );
    console.log('Registration email sent successfully');
  } catch (error) {
    console.error('Failed to send registration email:', error);
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentEmail = async (userEmail, userName, eventTitle, ticketCode) => {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured');
    return;
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        to_name: userName,
        event_title: eventTitle,
        ticket_code: ticketCode,
        message: `Your payment for ${eventTitle} has been confirmed. Your ticket code is: ${ticketCode}`
      }
    );
    console.log('Payment confirmation email sent successfully');
  } catch (error) {
    console.error('Failed to send payment email:', error);
  }
};

/**
 * Send announcement email
 */
export const sendAnnouncementEmail = async (userEmail, userName, eventTitle, announcementTitle, message) => {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured');
    return;
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        to_name: userName,
        event_title: eventTitle,
        announcement_title: announcementTitle,
        message: message
      }
    );
    console.log('Announcement email sent successfully');
  } catch (error) {
    console.error('Failed to send announcement email:', error);
  }
};

/**
 * Send event start notification email
 */
export const sendEventStartEmail = async (userEmail, userName, eventTitle, ticketCode) => {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
    console.warn('EmailJS not configured');
    return;
  }

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: userEmail,
        to_name: userName,
        event_title: eventTitle,
        ticket_code: ticketCode,
        message: `🎉 Your event ${eventTitle} has started! Join now using your ticket code: ${ticketCode}`
      }
    );
    console.log('Event start email sent successfully');
  } catch (error) {
    console.error('Failed to send event start email:', error);
  }
};

/**
 * Batch send emails (for multiple recipients)
 */
export const sendBatchEmails = async (recipients, emailFunction, ...args) => {
  const promises = recipients.map(recipient => {
    return emailFunction(recipient.email, recipient.name || recipient.email, ...args);
  });

  try {
    await Promise.all(promises);
    console.log(`Successfully sent ${recipients.length} emails`);
  } catch (error) {
    console.error('Error sending batch emails:', error);
  }
};

