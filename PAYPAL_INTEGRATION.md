# PayPal Integration Guide

This document explains how to integrate PayPal payments into the SuperAnalyst subscription system.

## 🚀 Features

- **PayPal Buttons**: Native PayPal checkout experience
- **Credit/Debit Card Fields**: Direct card payment processing
- **Secure Processing**: All sensitive data handled by PayPal
- **Webhook Support**: Asynchronous payment notifications
- **Multi-currency**: Support for USD and other currencies
- **Sandbox Testing**: Complete testing environment

## 📋 Prerequisites

### 1. PayPal Developer Account
- Sign up at [PayPal Developer Portal](https://developer.paypal.com/)
- Create a new app to get Client ID and Secret
- Enable PayPal Checkout and Card Fields

### 2. Environment Variables
Add these to your `.env.local` file:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. PayPal App Configuration
In your PayPal Developer Dashboard:

1. **App Settings**:
   - Enable "PayPal Checkout"
   - Enable "Card Fields"
   - Set return URLs

2. **Webhook Configuration** (Production):
   - URL: `https://yourdomain.com/api/payment/paypal/webhook`
   - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`

## 🔧 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Database Schema
Ensure your `payments` table has these fields:
```sql
ALTER TABLE payments ADD COLUMN paypal_order_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
```

### 3. Configure PayPal SDK
The PayPal JavaScript SDK is loaded dynamically in the `PayPalPayment` component.

## 🎯 Usage

### 1. Basic Integration
```tsx
import PayPalPayment from './components/PayPalPayment'

<PayPalPayment
  amount={29.99}
  planName="Standard Plan"
  planId="standard"
  userId={userId}
  locale="en"
  onSuccess={handleSuccess}
  onError={handleError}
  onCancel={handleCancel}
/>
```

### 2. Payment Flow
1. User selects subscription plan
2. User agreement is shown
3. PayPal payment interface appears
4. User completes payment via PayPal or card
5. Payment is captured and subscription activated
6. Success/error handling

## 🔒 Security Features

### 1. Data Protection
- **No sensitive data stored**: All payment info handled by PayPal
- **PCI compliance**: PayPal handles all card data
- **Encrypted communication**: HTTPS and PayPal security protocols

### 2. Authentication
- User authentication required for all payment operations
- Server-side validation of all requests
- CSRF protection via proper headers

### 3. Webhook Verification
- Webhook signature verification (production)
- Event type validation
- Secure webhook endpoint

## 🧪 Testing

### 1. Sandbox Environment
- Use PayPal sandbox credentials
- Test with sandbox PayPal accounts
- Test card numbers available in PayPal docs

### 2. Test Cards
```
Visa: 4005519200000004
Mastercard: 2223000048400011
American Express: 371449635398431
```

### 3. Test Scenarios
- Successful payment
- Payment decline
- User cancellation
- Network errors
- Invalid data

## 📱 Components

### 1. PayPalPayment
Main payment component with:
- PayPal buttons
- Credit card fields
- Payment processing
- Error handling

### 2. SubscriptionModal
Updated to integrate PayPal:
- Plan selection
- User agreement
- Payment flow

### 3. API Endpoints
- `/api/payment/paypal/create-order`: Create PayPal order
- `/api/payment/paypal/capture-order`: Capture payment
- `/api/payment/paypal/update-subscription`: Update user subscription
- `/api/payment/paypal/webhook`: Handle PayPal notifications

## 🌐 Production Deployment

### 1. Environment Setup
```bash
NODE_ENV=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=live_client_id
PAYPAL_CLIENT_ID=live_client_id
PAYPAL_CLIENT_SECRET=live_client_secret
PAYPAL_WEBHOOK_ID=live_webhook_id
```

### 2. SSL Requirements
- HTTPS required for production
- Valid SSL certificate
- Secure webhook endpoint

### 3. Monitoring
- Payment success/failure rates
- Webhook delivery status
- Error logging and alerting

## 🚨 Error Handling

### 1. Common Errors
- `INSTRUMENT_DECLINED`: Card declined
- `PAYER_ACCOUNT_RESTRICTED`: PayPal account issues
- `TRANSACTION_REFUSED`: Transaction blocked

### 2. User Experience
- Clear error messages
- Retry options
- Support contact information

## 📊 Analytics & Reporting

### 1. Payment Tracking
- Order creation
- Payment completion
- Subscription activation

### 2. Business Metrics
- Conversion rates
- Payment success rates
- Revenue tracking

## 🔄 Webhook Events

### 1. Payment Events
- `PAYMENT.CAPTURE.COMPLETED`: Payment successful
- `PAYMENT.CAPTURE.DENIED`: Payment failed
- `PAYMENT.CAPTURE.REFUNDED`: Payment refunded

### 2. Order Events
- `CHECKOUT.ORDER.APPROVED`: Order approved
- `CHECKOUT.ORDER.CANCELLED`: Order cancelled

## 📞 Support

### 1. PayPal Support
- [PayPal Developer Documentation](https://developer.paypal.com/)
- [PayPal Support](https://www.paypal.com/support/)

### 2. Implementation Issues
- Check browser console for errors
- Verify environment variables
- Test with sandbox credentials first

## 🔮 Future Enhancements

### 1. Additional Features
- Subscription management
- Recurring payments
- Refund processing
- Multi-language support

### 2. Integration Options
- Apple Pay
- Google Pay
- Local payment methods

---

**Note**: This integration follows PayPal's best practices and security guidelines. Always test thoroughly in sandbox before going live. 