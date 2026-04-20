const AfricasTalking = require('africastalking');

// AfricasTalking SMS — works great for Kenya (Safaricom, Airtel, Telkom)
// Get credentials at: https://account.africastalking.com
let smsClient = null;

const getSmsClient = () => {
  if (!smsClient) {
    const at = AfricasTalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME || 'sandbox',
    });
    smsClient = at.SMS;
  }
  return smsClient;
};

const sendSms = async ({ to, message }) => {
  try {
    const sms = getSmsClient();
    const result = await sms.send({
      to: Array.isArray(to) ? to : [to],
      message,
      // from: 'DropKE', // Optional: set sender name (requires AT approval)
    });
    console.log('SMS sent:', result);
    return result;
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
};

// Pre-built SMS templates for common notifications
const orderConfirmedSms = (orderNumber, amount) =>
  `Hi! Your order #${orderNumber} has been confirmed. Amount: KES ${amount}. We'll notify you when it ships. Thank you for shopping with us!`;

const orderShippedSms = (orderNumber, trackingInfo) =>
  `Your order #${orderNumber} has been shipped! ${trackingInfo ? `Tracking: ${trackingInfo}` : 'Delivery expected in 2-5 business days.'}`;

const orderDeliveredSms = (orderNumber) =>
  `Your order #${orderNumber} has been delivered! We hope you love your purchase. Rate your experience on our website.`;

module.exports = { sendSms, orderConfirmedSms, orderShippedSms, orderDeliveredSms };
