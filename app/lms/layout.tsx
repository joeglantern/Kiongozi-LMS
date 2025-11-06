"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '../contexts/UserContext';
import { BookOpen, GraduationCap, TrendingUp, Wand2, LogOut, User, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getSupabase } from '../utils/supabaseClient';

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navigation = [
    { name: 'All Paths', href: '/lms/browse', icon: BookOpen },
    { name: 'My Learning', href: '/lms/my-learning', icon: GraduationCap },
    { name: 'Progress', href: '/lms/progress', icon: TrendingUp },
  ];

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1d1f]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#c9975b]/20 border-t-[#c9975b] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Odin-style Dark Header */}
      <header className="bg-[#1c1d1f] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <Link href="/lms/browse" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/Kiongozi.png"
                  alt="Kiongozi"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  KIONGOZI LMS
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/lms/browse' && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2 text-sm font-medium transition-colors
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://kiongoziplatform.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                title="AI Chat"
              >
                <Wand2 className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">AI Chat</span>
              </a>

              {user && (
                <DropdownMenu
                  trigger={
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-300 hidden sm:inline max-w-[100px] truncate">
                        {user.full_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                    </div>
                  }
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </div>
                  </DropdownMenuItem>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-2 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide -mx-3 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/lms/browse' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                    ${isActive
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content - Light Background */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Kiongozi. Empowering green & digital transitions.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Support</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
