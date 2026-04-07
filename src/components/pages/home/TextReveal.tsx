"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

type TextRevealProps = {
  text: string;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  wordDelay?: number;
};

export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  wordDelay = 0.06,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isHeading = Tag === "h2" || Tag === "h3";

  if (!isHeading) {
    return (
      <motion.p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className={className}
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={
          isInView
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 20, filter: "blur(6px)" }
        }
        transition={{
          duration: 0.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {text}
      </motion.p>
    );
  }

  const words = text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 40, filter: "blur(8px)" }
          }
          transition={{
            duration: 0.3,
            delay: delay + i * wordDelay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
