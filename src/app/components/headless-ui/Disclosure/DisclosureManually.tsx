'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import ClosingDisclosure from './Code/ClosingDisclosureCode'

const DisclosureManually = () => {
  return (
    <div>
      <CodePreview
        component={<ClosingDisclosure />}
        filePath='src/app/components/headless-ui/Disclosure/Code/ClosingDisclosureCode.tsx'
        title='Closing Disclosures Manually'
      />
    </div>
  )
}

export default DisclosureManually
