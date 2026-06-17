"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FlipCardMotion() {
  return (
    <Card className="p-0 overflow-hidden max-w-md" >
    <motion.div
      whileHover={{ y: -8, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative"
    >
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-56"
        >
          <Image
            src="/images/blog/blog-img1.jpg"
            alt="Blog thumbnail"
            width={400}
            height={224}
            className="h-full w-full object-cover"
          />
        </motion.div>

        <span className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-gray-800 shadow">
          2 min Read
        </span>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-4 left-4 z-20"
        >
          <Image
            src="/images/profile/olivia.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-border shadow"
          />
        </motion.div>
      </div>

      <div className="space-y-3 p-4 mt-1">
        <span className="rounded-md bg-gray-100 dark:bg-white/10 px-2 py-1 text-xs font-medium text-gray-600 dark:text-white/60">
          Social
        </span>

        <motion.a
          whileHover={{ color: "#2563eb" }} 
          href="#"
          className="block text-lg font-semibold text-link! dark:!text-white transition-colors"
        >
          As yen tumbles, gadget-loving Japan goes for secondhand iPhones
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 text-sm text-gray-600 dark:text-white/60"
        >
          <div className="flex items-center gap-1">
            <Icon icon="mingcute:eye-2-line" width={16} height={16} /> 9,125
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="tabler:message" width={16} height={16} />  3
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Icon icon="fontisto:date" width={16} height={16} />  Mon, Dec 19
          </div>
        </motion.div>
      </div>
    </motion.div>
    </Card>
  );
}
