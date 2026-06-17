import './shiny.css'
import { Button } from '@/components/ui/button'

export default function ShinyButton() {
  return (
    <>
      <Button className=' bg-primary transition-all'>
        <div className='shiny font-medium text-base'>Shiny Button Text</div>
      </Button>
    </>
  )
}
