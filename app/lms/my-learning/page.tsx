"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserEnrollments } from '@/app/utils/courseClient';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CourseEnrollment, LearningStats } from '@/app/types/lms';
import { GraduationCap, BookOpen, Clock, Trophy, Flame } from 'lucide-react';

export default function MyLearningPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirect=/lms/my-learning');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, userLoading]);

  async function loadData() {
    if (!user) return;

    setLoading(true);
    try {
      const enrollmentsRes = await getUserEnrollments(user.id);

      if (enrollmentsRes.success && enrollmentsRes.data) {
        setEnrollments(enrollmentsRes.data);

        // Calculate basic stats from enrollments
        const completedCount = enrollmentsRes.data.filter((e: any) => e.status === 'completed').length;
        const inProgressCount = enrollmentsRes.data.filter((e: any) => e.status === 'active').length;

        setStats({
          in_progress_modules: inProgressCount,
          completed_modules: completedCount,
          total_time_spent_minutes: 0,
          current_streak_days: 0
        });
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
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

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Page Header */}
      <div className="bg-[#1c1d1f] text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#c9975b] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">My Learning</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">Track your progress and continue learning</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.in_progress_modules || 0}</p>
                <p className="text-xs sm:text-sm text-gray-400">In Progress</p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-[#2c2d2f] border-gray-700">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg bg-[#c9975b] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.current_streak_days || 0}</p>
                <p className="text-xs sm:text-sm text-gray-400">Day Streak</p>
              </div>
            </Card>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">My Courses</h2>

          {enrollments.length === 0 ? (
            <Card className="p-8 sm:p-12 bg-[#2c2d2f] border-gray-700 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-[#c9975b] flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Start learning by enrolling in a course</p>
              <Link
                href="/lms/browse"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm sm:text-base font-medium transition-colors"
              >
                Browse Courses
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.course || {};
                const progress = enrollment.progress_percentage || 0;

                return (
                  <Card
                    key={enrollment.id}
                    className="bg-[#2c2d2f] border-gray-700 hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Icon */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg bg-[#c9975b] flex items-center justify-center">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2">
                        {course.title || 'Course'}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-400">Progress</span>
                          <span className="text-xs sm:text-sm font-bold text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-[#c9975b] h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Course Meta */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{course.module_count || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{course.estimated_duration_hours || 0}h</span>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <Link href={`/lms/courses/${course.id}`}>
                        <button className="w-full py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs sm:text-sm font-medium transition-colors">
                          {progress > 0 ? 'Continue Learning' : 'Start Course'}
                        </button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <Card className="bg-white border border-gray-200">
              <div className="divide-y divide-gray-200">
                {stats.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.module?.title || 'Module'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.status === 'completed' ? 'Completed' : 'In progress'} •{' '}
                          {activity.progress_percentage}%
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {activity.status === 'completed' && (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
