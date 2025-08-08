import AlipaySdk from 'alipay-sdk'
import AlipayFormData from 'alipay-sdk/lib/form'

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  gateway: process.env.NODE_ENV === 'production' 
    ? 'https://openapi.alipay.com/gateway.do'
    : 'https://openapi.alipaydev.com/gateway.do',
})

export interface PaymentRequest {
  amount: number
  subject: string
  body: string
  outTradeNo: string
  returnUrl: string
  notifyUrl: string
}

export async function createAlipayOrder(payment: PaymentRequest) {
  const formData = new AlipayFormData()
  formData.setMethod('get')
  
  formData.addField('bizContent', {
    outTradeNo: payment.outTradeNo,
    productCode: 'FAST_INSTANT_TRADE_PAY',
    totalAmount: payment.amount.toFixed(2),
    subject: payment.subject,
    body: payment.body,
  })

  formData.addField('returnUrl', payment.returnUrl)
  formData.addField('notifyUrl', payment.notifyUrl)

  const result = await alipaySdk.exec(
    'alipay.trade.page.pay',
    {},
    { formData: formData },
  )

  return result
}

export async function verifyAlipayPayment(params: any) {
  return alipaySdk.checkNotifySign(params)
}

export const SUBSCRIPTION_PLANS = {
  monthly_99: {
    name: '月度订阅 (99元)',
    price: 99,
    reports: 30,
    type: 'monthly_99'
  },
  monthly_199: {
    name: '月度订阅 (199元)',
    price: 199,
    reports: 65,
    type: 'monthly_199'
  },
  pay_per_report: {
    name: '单篇报告 (5元)',
    price: 5,
    reports: 1,
    type: 'pay_per_report'
  }
} as const

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS 