"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserEnrollments } from '@/app/utils/courseClient';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { LearningStats } from '@/app/types/lms';
import { BarChart3, Trophy, Clock, Flame, BookOpen, Target } from 'lucide-react';

export default function ProgressPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirect=/lms/progress');
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user, userLoading]);

  async function loadStats() {
    if (!user) return;

    setLoading(true);
    try {
      const enrollmentsRes = await getUserEnrollments(user.id);

      if (enrollmentsRes.success && enrollmentsRes.data) {
        const enrollments = enrollmentsRes.data;
        const completedCount = enrollments.filter((e: any) => e.status === 'completed').length;
        const totalCount = enrollments.length;

        setStats({
          total_modules: totalCount,
          completed_modules: completedCount,
          in_progress_modules: enrollments.filter((e: any) => e.status === 'active').length,
          completion_rate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
          total_time_spent_minutes: 0,
          current_streak_days: 0,
          favorite_categories: []
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-[#c9975b] rounded-full animate-spin" />
      </div>
    );
  }

  const completionRate = stats ? Math.round(stats.completion_rate || 0) : 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Page Header */}
      <div className="bg-[#1c1d1f] text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#c9975b] flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Progress & Analytics</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Track your learning journey and achievements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {!stats ? (
          <Card className="p-8 sm:p-12 bg-[#2c2d2f] border-gray-700 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-[#c9975b] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No progress data yet</h3>
            <p className="text-sm sm:text-base text-gray-400">Start learning to see your progress</p>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.total_modules || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-400">Total Courses</p>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.completed_modules || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-400">Completed</p>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {Math.round((stats.total_time_spent_minutes || 0) / 60)}h
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Time Spent</p>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{completionRate}%</p>
                  <p className="text-xs sm:text-sm text-gray-400">Completion Rate</p>
                </div>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Achievements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* First Course */}
                {stats.total_modules > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#c9975b] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-white">First Steps</p>
                      <p className="text-xs text-gray-400">Enrolled in your first course</p>
                    </div>
                  </div>
                )}

                {/* Completed Course */}
                {stats.completed_modules > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#c9975b] flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-white">Course Complete</p>
                      <p className="text-xs text-gray-400">Completed {stats.completed_modules} course{stats.completed_modules > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {/* Multiple Courses */}
                {stats.total_modules >= 3 && (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#c9975b] flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-white">Committed Learner</p>
                      <p className="text-xs text-gray-400">Enrolled in 3+ courses</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
