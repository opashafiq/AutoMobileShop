import { Input } from '@/components/ui/input'

const SimpleInputcode = () => {
  return (
    <>
      <div className='max-w-sm flex flex-col gap-5'>
        <Input type='text' placeholder='Name' />
        <Input type='text' placeholder='Comapny' />
        <Input type='email' placeholder='Email' />
        <Input type='password' placeholder='Password' />
      </div>
    </>
  )
}

export default SimpleInputcode
