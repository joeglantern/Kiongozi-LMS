"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses, getCategories } from '@/app/utils/courseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course, ModuleCategory } from '@/app/types/lms';
import { Search, BookOpen, Clock } from 'lucide-react';

export default function BrowsePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  async function loadData() {
    setLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        getCourses({
          status: 'published',
          category_id: selectedCategory || undefined,
          limit: 50,
        }),
        getCategories(),
      ]);

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Odin-style difficulty colors
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#1c1d1f] text-white py-10 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-8 lg:mb-10 rounded-lg bg-[#c9975b] flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 tracking-tight">
            Learning Paths
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto px-4">
            Structured learning paths for building real-world skills. Choose your path and start learning today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c9975b] focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-[#1c1d1f] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                All Paths
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-[#1c1d1f] text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid - Odin style dark cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-gray-300 border-t-[#c9975b] rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-gray-500 text-sm sm:text-lg">No courses found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-[#2c2d2f] border-gray-700 text-white hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg bg-[#c9975b] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* PATH Label */}
                  <div className="text-center mb-2">
                    <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                      PATH
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-400">
                        {course.module_count || 0} modules
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-3 text-white">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-xs sm:text-sm text-center mb-3 sm:mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{course.estimated_duration_hours}h</span>
                    </div>
                    <Badge className={`${getDifficultyColor(course.difficulty_level)} text-xs`}>
                      {course.difficulty_level}
                    </Badge>
                  </div>

                  {/* Explore Button */}
                  <Link href={`/lms/courses/${course.id}`}>
                    <button className="w-full py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs sm:text-sm font-medium transition-colors">
                      Explore
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
