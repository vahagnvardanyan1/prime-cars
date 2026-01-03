"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#111111] border border-gray-300 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[scale-in_0.2s_ease-out] transition-colors duration-300">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-gray-300 dark:border-white/10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Sign in to access your account
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-black rounded-lg mb-6 border border-gray-300 dark:border-white/10">
            <button
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 rounded-md transition-all ${
                loginType === 'email'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginType('phone')}
              className={`flex-1 py-2 rounded-md transition-all ${
                loginType === 'phone'
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-gray-900 dark:text-white mb-2">
                {loginType === 'email' ? 'Email address' : 'Phone number'}
              </label>
              <input
                type={loginType === 'email' ? 'email' : 'tel'}
                placeholder={
                  loginType === 'email'
                    ? 'you@example.com'
                    : '+1 (555) 000-0000'
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-black rounded text-[#429de6] focus:ring-[#429de6]"
                />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[#429de6] hover:text-[#3a8acc] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 mt-6"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 px-4 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-gray-900 dark:text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="py-3 px-4 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-gray-900 dark:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <button className="text-[#429de6] hover:text-[#3a8acc] transition-colors">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}