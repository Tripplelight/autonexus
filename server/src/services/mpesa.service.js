// src/services/mpesa.service.js
import axios from 'axios';

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL
} = process.env;

const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke'; // switch to https://api.safaricom.co.ke in production

// ── Generate OAuth token ──────────────────────────────────────────────────────
const getAccessToken = async () => {
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` }
  });
  return res.data.access_token;
};

// ── Generate password ─────────────────────────────────────────────────────────
const getPassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// ── STK Push ──────────────────────────────────────────────────────────────────
export const stkPush = async ({ phone, amount, orderId, carName }) => {
  if (!MPESA_CONSUMER_KEY) {
    console.log('[MPESA SKIPPED] No credentials set');
    return { CheckoutRequestID: 'test_' + Date.now(), ResponseCode: '0' };
  }

  // Format phone: 0712345678 → 254712345678
  const formattedPhone = phone.startsWith('0')
    ? `254${phone.slice(1)}`
    : phone.startsWith('+')
    ? phone.slice(1)
    : phone;

  const token = await getAccessToken();
  const { password, timestamp } = getPassword();

  const res = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `AUTONEXUS-${orderId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `Deposit for ${carName}`
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

// ── Query STK Push status ─────────────────────────────────────────────────────
export const querySTKStatus = async (checkoutRequestId) => {
  const token = await getAccessToken();
  const { password, timestamp } = getPassword();

  const res = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};