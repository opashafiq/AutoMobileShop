import CodePreview from '@/app/components/shared/CodePreview'
import PaymentGatwaysCode from './code/PaymentGatwaysCode'

const paymentGatways = () => {
  return (
    <>
      <CodePreview
        component={<PaymentGatwaysCode />}
        filePath='src/app/components/widgets/cards/code/PaymentGatwaysCode.tsx'
        title='Payment Gateways Cards'
      />
    </>
  )
}

export default paymentGatways
