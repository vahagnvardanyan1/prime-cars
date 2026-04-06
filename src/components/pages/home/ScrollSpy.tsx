"use client";

import { useEffect, useState, useCallback } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "popular-deals", label: "Popular Deals" },
  { id: "import-calculator", label: "Import Calculator" },
];

const HEADER_HEIGHT = 80;

export function ScrollSpy() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  const handleScroll = useCallback(() => {
    const triggerPoint = window.innerHeight / 3;

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerPoint) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group relative flex items-center justify-center w-6 h-6"
            aria-label={`Scroll to ${section.label}`}
            type="button"
          >
            <span
              className={`rounded-full border-2 border-[#429de6] transition-all duration-300 ${
                isActive
                  ? "w-3.5 h-3.5 bg-[#429de6]"
                  : "w-3 h-3 bg-transparent group-hover:bg-[#429de6]/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
