"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  ThumbsUp,
  X,
} from "lucide-react";

const alertData = [
  {
    type: "success",
    icon: CheckCircle,
    title: "Well done!",
    message: "You successfully read this important message.",
    bg: "bg-success/10 border border-success text-success",
    hover: "hover:bg-success/20",
    animation: {
      animate: { y: [0, -3, 0] },
      transition: {
        repeat: Infinity,
        duration: 1.2,
        ease: "easeInOut" as const,
      },
    },
  },
  {
    type: "info",
    icon: Info,
    title: "Heads up!",
    message: "This alert needs your attention, but it's not super important.",
    bg: "bg-primary/10 border border-primary text-primary",
    hover: "hover:bg-primary/20",
    animation: {
      animate: { x: [0, -3, 3, -3, 0] },
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut" as const,
      },
    },
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Warning!",
    message: "Better check yourself, you're not looking too good.",
    bg: "bg-warning/10 border border-warning text-warning",
    hover: "hover:bg-warning/20",
    animation: {
      animate: { opacity: [1, 0.3, 1] },
      transition: {
        repeat: Infinity,
        duration: 1.2,
        ease: "linear" as const,
      },
    },
  },
  {
    type: "danger",
    icon: XCircle,
    title: "Oh snap!",
    message: "Change a few things up and try submitting again.",
    bg: "bg-error/10 border border-error text-error",
    hover: "hover:bg-error/20",
    animation: {
      animate: { scale: [1, 1.2, 1] },
      transition: {
        repeat: Infinity,
        duration: 1.3,
        ease: "easeInOut" as const,
      },
    },
  },
  {
    type: "primary",
    icon: ThumbsUp,
    title: "Nice!",
    message: "You successfully read this important message.",
    bg: "bg-secondary/10 border border-secondary text-secondary",
    hover: "hover:bg-secondary/20",
    animation: {
      animate: { y: [0, -4, 0] },
      transition: {
        repeat: Infinity,
        duration: 1.4,
        ease: "easeInOut" as const,
      },
    },
  },
];

export default function AlertCardMotion({replayAnimation=0}:any) {
  const [visible, setVisible] = useState(alertData.map(() => true));

  return (
    <section className="space-y-4">
      {alertData.map((alert, i) => {
        const Icon = alert.icon;
        return (
          <AnimatePresence key={i}>
            {visible[i] && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative flex items-center p-4 rounded-md cursor-pointer ${alert.bg} ${alert.hover}`}
              >
    
                <motion.span {...alert.animation} className="mr-3 flex items-center">
                  <Icon className="w-5 h-5" />
                </motion.span>

                <div className="flex-1">
                  <strong className="font-semibold">{alert.title}</strong>{" "}
                  <span>{alert.message}</span>
                </div>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.2 }}
                  whileTap={{ scale: 0.8, rotate: -90 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  onClick={() =>
                    setVisible((prev) =>
                      prev.map((v, idx) => (idx === i ? false : v))
                    )
                  }
                  className="ml-3"
                >
                  <X className="w-5 h-5 opacity-70 hover:opacity-100 transition" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </section>
  );
}
