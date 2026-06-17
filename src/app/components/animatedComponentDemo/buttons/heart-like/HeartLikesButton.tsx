"use client";

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react';
import { motion } from 'motion/react'
import { useState } from 'react';


const HeartLikesButton = () => {
  const [liked , setLiked] = useState(false);
  return (
    <> 
        <Button onClick={() => setLiked(!liked)} className="rounded-lg">
          <motion.span
            animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <Heart
              className={`size-4 ${liked ? "fill-error text-error-emphasis" : ""}`}
            />
            {liked ? "Liked" : "Like"}
          </motion.span>
        </Button>
    </>
  )
}

export default HeartLikesButton
