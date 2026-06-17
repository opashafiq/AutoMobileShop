import CodePreview from '@/app/components/shared/CodePreview'
import ShinyButtonCode from './ShinyButton'

export const ShinyEffect = () => {
  const cssCode = `
.shiny {
  color: #b5b5b5a4;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 60%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
  animation: shine 3s linear infinite;
}

@keyframes shine {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: -100%;
  }
}
    `

  return (
    <>
      <CodePreview
        component={<ShinyButtonCode />}
        cssCode={cssCode}
        filePath='src/app/components/animatedComponentDemo/buttons/shiny-effect/ShinyButton.tsx'
        title='Shiny Text Button'
        isAnimated={true}
      />
    </>
  )
}
