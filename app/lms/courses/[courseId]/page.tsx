"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourse, enrollInCourse, getCourseEnrollment } from '@/app/utils/courseClient';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course, CourseModule, CourseEnrollment } from '@/app/types/lms';
import { BookOpen, Clock, ChevronRight, Check } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const { user } = useUser();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId, user]);

  async function loadCourseData() {
    setLoading(true);
    try {
      const courseRes = await getCourse(courseId);

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        setModules(courseRes.data.modules || []);
      }

      // Check enrollment if user is logged in
      if (user) {
        const enrollmentRes = await getCourseEnrollment(courseId, user.id);
        if (enrollmentRes.success && enrollmentRes.data) {
          setEnrollment(enrollmentRes.data);
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    if (!user) {
      router.push(`/login?redirect=/lms/courses/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      const res = await enrollInCourse(courseId, user.id);
      if (res.success && res.data) {
        setEnrollment(res.data);
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-[#c9975b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Link href="/lms/browse" className="text-[#c9975b] hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Course Header - Light Background */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6">
            <Link href="/lms/browse" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
              ← All Paths
            </Link>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Copper Badge */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#c9975b] flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c9975b] to-[#b58647] flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">{course.category?.icon || '💎'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge className={`${getDifficultyColor(course.difficulty_level)} text-xs`}>
                  {course.difficulty_level}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{modules.length} modules</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{course.estimated_duration_hours} hours</span>
                </div>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Enroll Button - Sticky on mobile */}
            <div className="lg:flex-shrink-0 w-full lg:w-auto">
              {enrollment ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">Enrolled</p>
                  <p className="text-xs text-green-600">{enrollment.progress_percentage}% complete</p>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full lg:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Overview Section */}
        {course.overview && (
          <Card className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Overview</h2>
            <div className="prose prose-sm max-w-none text-sm sm:text-base text-gray-700">
              {course.overview}
            </div>
          </Card>
        )}

        {/* Course Modules - Odin Style */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Course Modules</h2>

          {modules.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center bg-white border border-gray-200">
              <p className="text-sm sm:text-base text-gray-500">No modules available yet.</p>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {modules.map((courseModule, index) => {
                const module = courseModule.learning_modules;
                if (!module) return null;

                return (
                  <Link
                    key={courseModule.id}
                    href={`/lms/courses/${courseId}/modules/${module.id}`}
                    className="block"
                  >
                    <Card className="p-3 sm:p-4 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Book Icon */}
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#c9975b] group-hover:text-white transition-colors">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-[#c9975b] transition-colors">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mt-0.5">
                              {module.description}
                            </p>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                          <span className="text-xs text-gray-500">
                            {module.estimated_duration_minutes} min
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#c9975b] transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Outcomes */}
        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
          <Card className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What You'll Learn</h2>
            <ul className="space-y-2">
              {course.learning_outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-700">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <Card className="p-4 sm:p-6 bg-white border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Prerequisites</h2>
            <ul className="space-y-2">
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-500">•</span>
                  <span className="text-sm sm:text-base text-gray-700">{prereq}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
