import CodePreview from '@/app/components/shared/CodePreview'
import StarFavouriteButtonCode from './StarFavouriteButton'

export const StarFavourite = () => {
  return (
    <>
      <CodePreview
        component={<StarFavouriteButtonCode />}
        filePath='src/app/components/animatedComponentDemo/buttons/star-favourite/StarFavouriteButton.tsx'
        title='Star Favourite Button'
        isAnimated={true}
      />
    </>
  )
}
