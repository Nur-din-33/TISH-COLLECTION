const axios = require('axios');

// Safaricom Daraja API integration
// Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke'; // Change to https://api.safaricom.co.ke for production

// Step 1: Get OAuth access token from Safaricom
const getAccessToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  const response = await axios.get(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  return response.data.access_token;
};

// Step 2: Generate the base64 password required for STK Push
const generatePassword = () => {
  const { MPESA_SHORTCODE, MPESA_PASSKEY } = process.env;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Step 3: Initiate STK Push (sends payment prompt to customer's phone)
const initiateStkPush = async ({ phone, amount, orderId, orderNumber }) => {
  const accessToken = await getAccessToken();
  const { password, timestamp } = generatePassword();

  // Format phone: 0712345678 → 254712345678
  const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), // Must be whole number
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.MPESA_CALLBACK_URL}`,
    AccountReference: orderNumber,
    TransactionDesc: `Payment for order ${orderNumber}`,
  };

  const response = await axios.post(
    `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

// Step 4: Query STK Push status (to check if user paid)
const queryStkStatus = async (checkoutRequestId) => {
  const accessToken = await getAccessToken();
  const { password, timestamp } = generatePassword();

  const response = await axios.post(
    `${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

module.exports = { initiateStkPush, queryStkStatus };
