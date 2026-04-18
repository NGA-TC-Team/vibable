"use client";

import { motion } from "framer-motion";

const METEORS = [
  { id: "m-01", top: "2%",  left: "0%",  delay: 0.0,  duration: 2.6, length: 140, size: 3.2 },
  { id: "m-02", top: "8%",  left: "12%", delay: 0.7,  duration: 3.0, length: 110, size: 2.5 },
  { id: "m-03", top: "14%", left: "28%", delay: 1.4,  duration: 2.8, length: 130, size: 3.0 },
  { id: "m-04", top: "20%", left: "5%",  delay: 0.3,  duration: 3.2, length: 120, size: 2.8 },
  { id: "m-05", top: "26%", left: "42%", delay: 1.1,  duration: 2.5, length: 150, size: 3.5 },
  { id: "m-06", top: "32%", left: "18%", delay: 2.0,  duration: 3.1, length: 100, size: 2.2 },
  { id: "m-07", top: "38%", left: "55%", delay: 0.6,  duration: 2.9, length: 135, size: 3.0 },
  { id: "m-08", top: "44%", left: "35%", delay: 1.8,  duration: 3.3, length: 115, size: 2.6 },
  { id: "m-09", top: "50%", left: "8%",  delay: 0.9,  duration: 2.7, length: 145, size: 3.3 },
  { id: "m-10", top: "56%", left: "68%", delay: 1.5,  duration: 3.0, length: 105, size: 2.4 },
  { id: "m-11", top: "62%", left: "22%", delay: 0.2,  duration: 2.8, length: 125, size: 2.9 },
  { id: "m-12", top: "68%", left: "48%", delay: 2.3,  duration: 3.4, length: 95,  size: 2.1 },
  { id: "m-13", top: "74%", left: "15%", delay: 1.0,  duration: 2.6, length: 140, size: 3.1 },
  { id: "m-14", top: "80%", left: "60%", delay: 0.5,  duration: 3.1, length: 118, size: 2.7 },
  { id: "m-15", top: "86%", left: "32%", delay: 1.7,  duration: 2.9, length: 132, size: 3.0 },
  { id: "m-16", top: "92%", left: "75%", delay: 2.6,  duration: 3.5, length: 90,  size: 2.0 },
  { id: "m-17", top: "4%",  left: "50%", delay: 1.2,  duration: 2.7, length: 128, size: 2.8 },
  { id: "m-18", top: "48%", left: "82%", delay: 0.4,  duration: 3.2, length: 108, size: 2.5 },
];

export default function Loading() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white">
      {/* Meteor shower background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {METEORS.map((meteor) => (
          <motion.div
            key={meteor.id}
            className="absolute"
            style={{ top: meteor.top, left: meteor.left }}
            initial={{ x: -60, y: 0, opacity: 0 }}
            animate={{
              x: 520,
              y: 300,
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              duration: meteor.duration,
              delay: meteor.delay,
              ease: "easeOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2.0,
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

      {/* Center spinner + label */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-200/40"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute inset-[6px] rounded-full border-2 border-transparent border-t-sky-300"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.7, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <motion.p
          className="text-sm font-medium tracking-widest text-cyan-500 uppercase"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.0, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
        >
          Loading
        </motion.p>
      </div>
    </main>
  );
}
