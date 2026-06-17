"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BellMinus,
  BellOffIcon,
  Sparkles,
  Heart,
  Star,
  Bell,
} from "lucide-react";


function ExampleCard({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="rounded-2xl shadow-sm border-muted/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4" /> {title}
        </CardTitle>
        {subtitle ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}

const Buttons = () => {

  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [bell, setBell] = useState(false);
 
  return (
    <div className="space-y-6">
      <ExampleCard
        title="Hover Lift"
        subtitle="Subtle translate & shadow for depth on hover."
      >
        <Button asChild className="rounded-lg">
          <motion.button
            whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            Lift on hover
          </motion.button>
        </Button>
      </ExampleCard>

      <ExampleCard
        title="Tap Pop"
        subtitle="Micro-interaction that pops on press."
      >
        <Button asChild variant="secondary" className="rounded-lg">
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            Tap pop
          </motion.button>
        </Button>
      </ExampleCard>
      <ExampleCard
        title="Playful Wiggle"
        subtitle="A quick oscillation to attract attention."
      >
        <Button asChild variant="outline" className="rounded-lg">
          <motion.button
            whileHover={{ rotate: [0, -3, 3, -2, 2, 0] }}
            transition={{ duration: 0.5 }}
          >
            Hover wiggle
          </motion.button>
        </Button>
      </ExampleCard>
      <ExampleCard title="Heart Like" subtitle="Toggle with pop animation.">
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
      </ExampleCard>
      <ExampleCard title="Star Favorite" subtitle="Star shines when active.">
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
      </ExampleCard>
      <ExampleCard title="Bell Notify" subtitle="Rings when toggled.">
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
      </ExampleCard>
    </div>
  );
};

export default Buttons;
