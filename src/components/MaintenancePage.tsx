"use client";

import { useEffect, useState } from "react";

import { Wrench, Zap, Shield, Sparkles } from "lucide-react";



export const MaintenancePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-[#0b0f14]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#429de6]/5 dark:bg-[#429de6]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(66,157,230,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(66,157,230,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(66,157,230,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,157,230,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className={`max-w-4xl w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Main Content Card */}
          <div className="text-center space-y-8 sm:space-y-12">
            
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative group">
                {/* Rotating Ring */}
                <div className="absolute inset-0 -m-4 sm:-m-8">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-[#429de6]/20 dark:border-[#429de6]/30 animate-[spin_20s_linear_infinite]" />
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#429de6]/20 dark:bg-[#429de6]/30 blur-3xl rounded-full animate-pulse" />
                
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-white to-blue-50/50 dark:from-[#0b0f14] dark:to-[#1a1f2e] p-8 sm:p-12 rounded-3xl border-2 border-[#429de6]/20 dark:border-[#429de6]/30 shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-105 duration-300">
                  <Wrench className="h-16 w-16 sm:h-20 sm:w-20 text-[#429de6] animate-[spin_3s_ease-in-out_infinite]" />
                  
                  {/* Sparkles */}
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-[#429de6] animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-4 sm:space-y-6 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#429de6]/10 dark:bg-[#429de6]/20 rounded-full border border-[#429de6]/20 dark:border-[#429de6]/30">
                <div className="h-2 w-2 bg-[#429de6] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-[#429de6]">System Update in Progress</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent leading-tight">
                We'll Be Back Soon
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                We're performing scheduled maintenance to bring you an even better experience. 
                Thank you for your patience!
              </p>
            </div>

            {/* Info Cards */}
            <div className="flex justify-center max-w-4xl mx-auto mt-8 sm:mt-12 px-4">
              {/* Status Card */}
              <div className="group bg-white/80 dark:bg-[#0b0f14]/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Status</h3>
                    <p className="text-green-500 font-medium">All Systems Safe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Message */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="relative bg-gradient-to-r from-[#429de6]/5 via-purple-500/5 to-[#429de6]/5 dark:from-[#429de6]/10 dark:via-purple-500/10 dark:to-[#429de6]/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#429de6]/20 dark:border-[#429de6]/30 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                
                <div className="relative flex items-start gap-4">
                  <Zap className="h-6 w-6 text-[#429de6] flex-shrink-0 animate-pulse" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      Upgrading Your Experience
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      Our team is implementing exciting new features and improvements. 
                      We appreciate your patience and can't wait to show you what's new!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto px-4">
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#429de6] via-purple-500 to-[#429de6] animate-[progress_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center items-center gap-3">
              <div className="h-3 w-3 bg-[#429de6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-3 w-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-3 w-3 bg-[#429de6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes progress {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
