"use client";

import React, { ReactNode, useRef } from "react";
import { motion, useInView } from "motion/react";
import SimpleBar from "simplebar-react";
import { Home, User, Settings, Bell, Calendar, FileText, Lock, MessageCircle, ShoppingCart, HelpCircle } from "lucide-react";

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0, y: 30 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 + delay }}
      className="mb-4"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  replayAnimation?: number;
}



const items = [
  { name: "View your dashboard with recent activities and stats", icon: Home },
  { name: "Manage your profile, preferences, and account details", icon: User },
  { name: "Configure settings to customize your experience", icon: Settings },
  { name: "Receive notifications and stay updated on tasks", icon: Bell },
  { name: "Schedule and track events in your calendar", icon: Calendar },
  { name: "Organize and access your documents easily", icon: FileText },
  { name: "Enhance security with passwords and permissions", icon: Lock },
  { name: "Chat with team members and collaborate effectively", icon: MessageCircle },
  { name: "Track orders and manage purchases seamlessly", icon: ShoppingCart },
  { name: "Find help articles or contact support for assistance", icon: HelpCircle },
];


const AnimatedListMotion: React.FC<AnimatedListProps> = ({replayAnimation=0}) => {
  return (
    <SimpleBar className="max-h-[200px]" key={replayAnimation} >
    <div className={`w-[400px]overflow-y-auto`} >
      {items.map((item, index) => (
        <AnimatedItem key={index} index={index}>
          <div className={`p-3 bg-primary rounded-lg flex items-center gap-2`}>
            <item.icon className="h-4 w-4 text-white"/>
            <p className="text-white m-0 text-sm">{item.name}</p>
          </div>
        </AnimatedItem>
      ))}
    </div>
    </SimpleBar>
  );
};

export default AnimatedListMotion;
