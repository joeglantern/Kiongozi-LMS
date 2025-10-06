"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getModule, getCourse, updateModuleProgress, getModuleProgress } from '@/app/utils/courseClient';
import { useUser } from '@/app/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LearningModule, Course, CourseModule, UserProgress } from '@/app/types/lms';
import { BookOpen, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function ModuleViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const courseId = params?.courseId as string;
  const moduleId = params?.moduleId as string;

  const [module, setModule] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (courseId && moduleId) {
      loadModuleData();
    }
  }, [courseId, moduleId, user]);

  async function loadModuleData() {
    setLoading(true);
    try {
      const [moduleRes, courseRes] = await Promise.all([
        getModule(moduleId),
        getCourse(courseId),
      ]);

      if (moduleRes.success && moduleRes.data) {
        setModule(moduleRes.data);
      }

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        setAllModules(courseRes.data.modules || []);
      }

      // Load progress if user is logged in
      if (user) {
        const progressRes = await getModuleProgress(moduleId, user.id);
        if (progressRes.success && progressRes.data) {
          setProgress(progressRes.data);
        }
      }
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete() {
    if (!module || !user) {
      if (!user) {
        router.push(`/login?redirect=/lms/courses/${courseId}/modules/${moduleId}`);
      }
      return;
    }

    setMarkingComplete(true);
    try {
      const res = await updateModuleProgress(moduleId, courseId, user.id, 'completed');

      if (res.success && res.data) {
        setProgress(res.data);
      }
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setMarkingComplete(false);
    }
  }

  // Find current module in the list
  const currentIndex = allModules.findIndex((m) => m.learning_modules?.id === moduleId);
  const previousModule = currentIndex > 0 ? allModules[currentIndex - 1]?.learning_modules : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1]?.learning_modules : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-[#c9975b] rounded-full animate-spin" />
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Module not found</p>
          <Link href={`/lms/courses/${courseId}`} className="text-[#c9975b] hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/lms/browse" className="text-gray-600 hover:text-gray-900">
              Paths
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/lms/courses/${courseId}`} className="text-gray-600 hover:text-gray-900">
              {course.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{module.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
          {/* Main Content Area - Left Side */}
          <div>
            {/* Module Header with Copper Badge */}
            <div className="mb-6 flex gap-4 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-[#c9975b] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9975b] to-[#b58647] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {module.title}
                </h1>
                <p className="text-gray-600">{course.category?.name}</p>
              </div>
            </div>

            {/* Module Description */}
            {module.description && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-700">{module.description}</p>
              </div>
            )}

            {/* Main Content - Odin Style */}
            <Card className="p-8 bg-white border border-gray-200 mb-6">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                      ) : (
                        <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props} />
                      ),
                    a: ({ node, ...props }) => <a className="text-[#c9975b] hover:underline" {...props} />,
                  }}
                >
                  {module.content}
                </ReactMarkdown>
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 mb-8">
              {previousModule ? (
                <Link
                  href={`/lms/courses/${courseId}/modules/${previousModule.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Previous</span>
                </Link>
              ) : (
                <div />
              )}

              {nextModule ? (
                <Link
                  href={`/lms/courses/${courseId}/modules/${nextModule.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors ml-auto"
                >
                  <span className="text-sm font-medium">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/lms/courses/${courseId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9975b] text-white rounded-lg hover:bg-[#b58647] transition-colors ml-auto"
                >
                  <span className="text-sm font-medium">Back to Course</span>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side (Sticky) */}
          <div className="lg:sticky lg:top-24 h-fit">
            {/* Lesson Contents */}
            <Card className="p-6 bg-white border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lesson contents</h3>
              <div className="space-y-2">
                {allModules.map((courseModule) => {
                  const mod = courseModule.learning_modules;
                  if (!mod) return null;

                  const isCurrent = mod.id === moduleId;

                  return (
                    <Link
                      key={courseModule.id}
                      href={`/lms/courses/${courseId}/modules/${mod.id}`}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-900 font-medium border-l-3 border-[#c9975b]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {mod.title}
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Mark Complete Button */}
            <Card className="p-6 bg-white border border-gray-200">
              {isCompleted ? (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-800 mb-1">Completed!</p>
                  <p className="text-xs text-gray-600">Great job on finishing this module</p>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="w-full px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {markingComplete ? 'Marking...' : 'Mark as Complete'}
                </button>
              )}

              {/* Module Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{module.estimated_duration_minutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Difficulty:</span>
                  <Badge className="text-xs">{module.difficulty_level}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
