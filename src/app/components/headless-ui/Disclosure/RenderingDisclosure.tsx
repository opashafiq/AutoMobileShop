'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import RenderDiclosure from './Code/RenderDiclosureCode'

const RenderingDisclosure = () => {
  return (
    <div>
      <CodePreview
        component={<RenderDiclosure />}
        filePath='src/app/components/headless-ui/Disclosure/Code/RenderDiclosureCode.tsx'
        title='Rendering As Different Elements'
      />
    </div>
  )
}

export default RenderingDisclosure
