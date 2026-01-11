"use client";

export const RacingCarAnimation = () => {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-700">
        <div className="absolute inset-0 flex gap-8 animate-road-lines">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-12 h-full bg-white dark:bg-gray-500" />
          ))}
        </div>
      </div>

      {/* Racing Car */}
      <div className="absolute bottom-2 left-0 animate-race-car">
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          {/* Car Body */}
          <path
            d="M30 35 L35 25 L55 20 L75 20 L85 25 L100 25 L110 30 L110 40 L100 45 L20 45 L15 40 L15 35 Z"
            fill="#429de6"
            stroke="#2563eb"
            strokeWidth="2"
          />
          
          {/* Car Window */}
          <path
            d="M40 25 L45 22 L65 22 L70 25 L70 30 L40 30 Z"
            fill="#60a5fa"
            opacity="0.6"
          />
          
          {/* Front Detail */}
          <rect x="95" y="28" width="12" height="8" rx="2" fill="#fbbf24" />
          
          {/* Racing Stripes */}
          <line x1="50" y1="32" x2="80" y2="32" stroke="white" strokeWidth="2" opacity="0.8" />
          
          {/* Wheels */}
          <circle cx="35" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />
          <circle cx="35" cy="45" r="4" fill="#6b7280" />
          <circle cx="90" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />
          <circle cx="90" cy="45" r="4" fill="#6b7280" />
          
          {/* Speed Lines */}
          <line x1="10" y1="30" x2="5" y2="30" stroke="#429de6" strokeWidth="2" opacity="0.5" className="animate-speed-line-1" />
          <line x1="8" y1="35" x2="3" y2="35" stroke="#429de6" strokeWidth="2" opacity="0.5" className="animate-speed-line-2" />
          <line x1="12" y1="40" x2="7" y2="40" stroke="#429de6" strokeWidth="2" opacity="0.5" className="animate-speed-line-3" />
        </svg>
      </div>

      {/* Dust Clouds */}
      <div className="absolute bottom-4 left-0 animate-dust-1">
        <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 opacity-30 blur-sm" />
      </div>
      <div className="absolute bottom-4 left-0 animate-dust-2">
        <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 opacity-20 blur-sm" />
      </div>

      <style jsx>{`
        @keyframes race-car {
          0% {
            transform: translateX(-150px);
          }
          100% {
            transform: translateX(calc(100vw + 50px));
          }
        }

        @keyframes road-lines {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-80px);
          }
        }

        @keyframes dust-cloud {
          0% {
            transform: translateX(0) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-100px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes speed-line {
          0% {
            transform: translateX(0);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-20px);
            opacity: 0;
          }
        }

        .animate-race-car {
          animation: race-car 3s ease-in-out infinite;
        }

        .animate-road-lines {
          animation: road-lines 0.8s linear infinite;
        }

        .animate-dust-1 {
          animation: race-car 3s ease-in-out infinite, dust-cloud 1s ease-out infinite;
        }

        .animate-dust-2 {
          animation: race-car 3s ease-in-out infinite 0.2s, dust-cloud 1.2s ease-out infinite 0.2s;
        }

        .animate-speed-line-1 {
          animation: speed-line 0.4s ease-out infinite;
        }

        .animate-speed-line-2 {
          animation: speed-line 0.4s ease-out infinite 0.1s;
        }

        .animate-speed-line-3 {
          animation: speed-line 0.4s ease-out infinite 0.2s;
        }
      `}</style>
    </div>
  );
};
