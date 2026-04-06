"use client";

import { motion } from "motion/react";
import Image from "next/image";

export function HeroContainers() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
      <motion.div
        className="absolute left-[0%] lg:left-[1%] top-0 w-36 lg:w-44"
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 30,
          mass: 2.5,
        }}
      >
        <Image
          src="https://cdn-pipeline-output.picsart.com/magic-flow/dce171fa-f73e-481e-8e09-554dbbc80964.png?type=webp&to=min&r=1024&q=80"
          alt="Green shipping container"
          width={300}
          height={500}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </div>
  );
}
