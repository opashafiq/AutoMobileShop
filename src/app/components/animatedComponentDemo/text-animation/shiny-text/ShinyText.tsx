import CodePreview from '@/app/components/shared/CodePreview'
import ShinyTextAnimationCode from './ShinyTextAnimation'

export const ShinyText = () => {
  const cssCode = `
.shiny {
  color: #00ceffa4;
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
        component={<ShinyTextAnimationCode />}
        cssCode={cssCode}
        filePath='src/app/components/animatedComponentDemo/text-animation/shiny-text/ShinyTextAnimation.tsx'
        title='Shiny Text'
        isAnimated={true}
      />
    </>
  )
}
