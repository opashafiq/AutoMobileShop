'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import Basicdisclosure from './Code/BasicDisclosureCode'

const BasicDisclosure = () => {
  return (
    <div>
      <CodePreview
        component={<Basicdisclosure />}
        filePath='src/app/components/headless-ui/Disclosure/Code/BasicDisclosureCode.tsx'
        title='Basic Disclosure'
      />
    </div>
  )
}

export default BasicDisclosure
