"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to browse page on load
    router.push('/lms/browse');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1d1f]">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#c9975b] to-[#b58647] flex items-center justify-center">
          <span className="text-4xl">🌱</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Kiongozi LMS</h1>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
