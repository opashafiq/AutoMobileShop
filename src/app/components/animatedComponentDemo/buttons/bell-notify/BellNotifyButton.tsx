"use client";

import { Button } from '@/components/ui/button'
import { Bell, BellOffIcon } from 'lucide-react';
import { motion } from 'motion/react'
import { useState } from 'react';


const BellNotifyButton = () => {
    const [bell, setBell] = useState(false);

    return (
        <>
            <Button onClick={() => setBell(!bell)} className="rounded-lg">
                <motion.span
                    animate={{
                        rotate: bell ? [0, -15, 15, -10, 10, 0] : [0, 0, -15, 10, -10, 0],
                    }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-2"
                >
                    {bell ? (
                        <Bell className="size-4" />
                    ) : (
                        <BellOffIcon className="size-4" />
                    )}{" "}
                    {bell ? "On" : "Off"}
                </motion.span>
            </Button>

        </>
    )
}

export default BellNotifyButton
