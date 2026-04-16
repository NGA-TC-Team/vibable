"use client";

import { motion } from "framer-motion";
import { useSystemRuntime } from "@/services/store/hooks";

const METEORS = [
  { id: "meteor-1", top: "6%", delay: 0.1, duration: 2.8, length: 90, size: 3 },
  { id: "meteor-2", top: "18%", delay: 0.9, duration: 3.1, length: 72, size: 2 },
  { id: "meteor-3", top: "31%", delay: 1.7, duration: 2.6, length: 84, size: 2.5 },
  { id: "meteor-4", top: "47%", delay: 0.45, duration: 3.3, length: 76, size: 2.2 },
  { id: "meteor-5", top: "63%", delay: 1.25, duration: 2.9, length: 88, size: 2.8 },
  { id: "meteor-6", top: "79%", delay: 2.05, duration: 3.4, length: 70, size: 2 },
];

export function SidebarMeteor({ collapsed = false }: { collapsed?: boolean }) {
  const { prefersReducedMotion } = useSystemRuntime();
  const meteors = collapsed ? METEORS.filter((_, index) => index % 2 === 0) : METEORS;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {prefersReducedMotion
        ? null
        : meteors.map((meteor) => (
            <motion.div
              key={meteor.id}
              className="absolute left-0"
              style={{ top: meteor.top }}
              initial={{ x: -48, y: 0, opacity: 0 }}
              animate={{
                x: collapsed ? 64 : 168,
                y: collapsed ? 58 : 126,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: meteor.duration,
                delay: meteor.delay,
                ease: "easeOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1.8,
              }}
            >
              <div
                className="relative"
                style={{ width: meteor.length, height: meteor.size * 10 }}
              >
                <div
                  className="absolute right-0 top-1/2 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.85)]"
                  style={{
                    width: meteor.size * 2,
                    height: meteor.size * 2,
                    transform: "translateY(-50%)",
                  }}
                />
                <div
                  className="absolute right-1 top-1/2 rounded-full"
                  style={{
                    width: meteor.length,
                    height: meteor.size,
                    transform: "translateY(-50%) rotate(24deg)",
                    transformOrigin: "right center",
                    background:
                      "linear-gradient(90deg, rgba(56,189,248,0), rgba(56,189,248,0.2) 42%, rgba(103,232,249,0.95) 100%)",
                    filter: "drop-shadow(0 0 10px rgba(34,211,238,0.55))",
                  }}
                />
              </div>
            </motion.div>
          ))}
    </div>
  );
}
