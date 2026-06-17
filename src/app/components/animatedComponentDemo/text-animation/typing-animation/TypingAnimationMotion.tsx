'use client'

import { useEffect, useState } from 'react'

export default function TypingAnimationMotion() {
  const words = [
    'Hello, World!',
    'Welcome to my website!',
    'This is a typewriter effect.',
  ]
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const currentWord = words[i]

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(currentWord.substring(0, j - 1))
        setJ(j - 1)

        if (j === 0) {
          setIsDeleting(false)
          setI((prev) => (prev + 1) % words.length)
        }
      } else {
        setText(currentWord.substring(0, j + 1))
        setJ(j + 1)

        if (j === currentWord.length) {
          setIsDeleting(true)
        }
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [j, i, isDeleting, words])

  return (
    <div className='w-full h-full flex justify-start items-center min-h-10'>
      <h1 className='text-2xl font-medium text-primary'>{text}</h1>
    </div>
  )
}
