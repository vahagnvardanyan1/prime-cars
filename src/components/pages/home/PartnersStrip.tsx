"use client";

import { motion, useAnimationControls } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const partners = [
  { name: "Partner 1", logo: "/our-partners/1.png" },
  { name: "Partner 2", logo: "/our-partners/2.png" },
  { name: "Partner 3", logo: "/our-partners/3.png" },
  { name: "Partner 4", logo: "/our-partners/4.png" },
  { name: "Partner 5", logo: "/our-partners/5.png" },
  { name: "Partner 6", logo: "/our-partners/6.png" },
  { name: "Partner 7", logo: "/our-partners/7.png" },
  { name: "Partner 8", logo: "/our-partners/8.png" },
  { name: "Partner 9", logo: "/our-partners/9.png" },
  { name: "Partner 10", logo: "/our-partners/10.png" },
];

export function PartnersStrip() {
  const t = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const controls = useAnimationControls();
  const isPaused = useRef(false);
  const currentX = useRef(0);

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.scrollWidth / 2);
    }
  }, []);

  useEffect(() => {
    if (trackWidth === 0) return;

    const startAnimation = (from: number) => {
      const remaining = trackWidth - Math.abs(from);
      const duration = (remaining / trackWidth) * 25;

      controls.start({
        x: -trackWidth,
        transition: {
          x: {
            from,
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          },
        },
      });
    };

    startAnimation(0);
    currentX.current = 0;
  }, [trackWidth, controls]);

  const handleHoverStart = () => {
    isPaused.current = true;
    const el = trackRef.current;
    if (el) {
      const style = getComputedStyle(el);
      const matrix = new DOMMatrix(style.transform);
      currentX.current = matrix.m41;
    }
    controls.stop();
  };

  const handleHoverEnd = () => {
    isPaused.current = false;
    if (trackWidth === 0) return;

    const from = currentX.current % -trackWidth || currentX.current;
    const remaining = trackWidth - Math.abs(from);
    const duration = (remaining / trackWidth) * 25;

    controls.start({
      x: -trackWidth,
      transition: {
        x: {
          from,
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      },
    });
  };

  return (
    <div className="text-center">
      <motion.h2
        className="mb-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        {t("home.ourPartners.title")}
      </motion.h2>

      <motion.p
        className="max-w-2xl mx-auto mb-12 text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {t("home.ourPartners.description")}
      </motion.p>

      <div
        className="relative overflow-hidden"
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
      >
        <motion.div
          ref={trackRef}
          className="flex w-max"
          animate={controls}
          drag="x"
          dragConstraints={{ left: -trackWidth, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => {
            isPaused.current = true;
            controls.stop();
          }}
          onDragEnd={(_, info) => {
            isPaused.current = false;
            const el = trackRef.current;
            if (el) {
              const style = getComputedStyle(el);
              const matrix = new DOMMatrix(style.transform);
              currentX.current = matrix.m41;
            }
            handleHoverEnd();
          }}
        >
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={60}
                className="h-10 lg:h-12 w-auto object-contain transition-all duration-300 pointer-events-none select-none"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
