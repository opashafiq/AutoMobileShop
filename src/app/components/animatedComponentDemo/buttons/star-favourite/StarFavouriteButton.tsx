"use client";

import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react';
import { motion } from 'motion/react'
import { useState } from 'react';


const StarFavouriteButton = () => {
    const [starred , setStarred] = useState(false);
  return (
    <>
        <Button onClick={() => setStarred(!starred)} className="rounded-lg">
          <motion.span
            animate={{ rotate: starred ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Star
              className={`size-4 ${
                starred ? "fill-warning text-warning-emphasis" : ""
              }`}
            />
          </motion.span>
          {starred ? "Starred" : "Star"}
        </Button>
    </>
  )
}

export default StarFavouriteButton
