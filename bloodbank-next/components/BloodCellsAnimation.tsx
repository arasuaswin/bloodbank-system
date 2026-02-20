"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function BloodCellsAnimation() {
    const [cells, setCells] = useState<any[]>([])

    useEffect(() => {
        // Generate random blood cells
        const newCells = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // Random start position %
            y: Math.random() * 100,
            size: Math.random() * 60 + 20, // Random size 20-80px
            duration: Math.random() * 20 + 10, // Random duration 10-30s
            delay: Math.random() * 5,
            blur: Math.random() * 4, // Blur for depth of field
        }))
        setCells(newCells)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {cells.map((cell) => (
                <motion.div
                    key={cell.id}
                    className="absolute rounded-full opacity-40 mix-blend-overlay"
                    style={{
                        left: `${cell.x}%`,
                        top: `${cell.y}%`,
                        width: cell.size,
                        height: cell.size,
                        background: "radial-gradient(circle at 30% 30%, rgba(255, 100, 100, 0.9), rgba(150, 0, 0, 0.8))",
                        boxShadow: "inset -5px -5px 10px rgba(100, 0, 0, 0.5), 5px 5px 15px rgba(0, 0, 0, 0.2)",
                        filter: `blur(${cell.blur}px)`,
                    }}
                    animate={{
                        y: [0, -100, 0], // Float up and down variation
                        x: [0, Math.random() * 50 - 25, 0], // Slight horizontal drift
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: cell.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: cell.delay,
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
        </div>
    )
}
