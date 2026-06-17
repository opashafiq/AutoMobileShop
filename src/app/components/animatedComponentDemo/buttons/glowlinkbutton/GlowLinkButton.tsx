"use client";

import Link from "next/link";
import React, { useRef } from "react";

interface GlowLinkButtonProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    target?: string;
    glowColor?: string; // optional: customize glow
}

export default function GlowLinkButton({
    href,
    children,
    className = "",
    target = "",
    glowColor = "#FF590099", // default glow color
}: GlowLinkButtonProps) {
    const glowRef = useRef<HTMLSpanElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (glowRef.current) {
            glowRef.current.style.left = `${x}px`;
            glowRef.current.style.top = `${y}px`;
        }
    };

    const handleMouseEnter = () => {
        if (glowRef.current) glowRef.current.style.opacity = "1";
    };

    const handleMouseLeave = () => {
        if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    return (
        <Link
            href={href}
            target={target}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden inline-flex items-center justify-center font-bold rounded-full transition duration-300 ${className}`}
        >
            {children}
            <span
                ref={glowRef}
                className="glow pointer-events-none absolute z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle, ${glowColor}, transparent 80%)`,
                }}
            />
        </Link>
    );
}
