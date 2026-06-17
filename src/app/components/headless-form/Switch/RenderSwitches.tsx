'use client'

import CodePreview from '@/app/components/shared/CodePreview'
import RenderAsElements from './Codes/RenderAsElements'

const RenderSwitches = () => {
  return (
    <div>
      <CodePreview
        component={<RenderAsElements />}
        filePath='src/app/components/headless-form/Switch/Codes/RenderAsElements.tsx'
        title='Rendering as Element'
      />
    </div>
  )
}

export default RenderSwitches
