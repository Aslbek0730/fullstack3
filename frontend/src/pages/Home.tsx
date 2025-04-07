import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store'
import {
  fetchPopularCourses,
  fetchRecommendedCourses,
  Course
} from '../store/slices/courseSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const handleCourseClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/courses/${course.id}`)
    }
  }

  return (
    <div
      onClick={handleCourseClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform hover:scale-105"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold text-white">{course.title}</h3>
        <p className="mb-4 text-sm text-gray-400 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-indigo-400">${course.price}</span>
            <div className="flex items-center text-yellow-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm">{course.rating}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {course.totalStudents} students
          </div>
        </div>
      </div>
    </div>
  )
}

const Banner = () => (
  <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900">
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black opacity-50" />
    </div>
    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Welcome to <span className="text-indigo-400">Shams Academy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
          Discover a world of knowledge with our expert-led courses. Start your learning journey today
          and unlock your potential.
        </p>
        <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
          <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <Link
              to="/courses"
              className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:px-8"
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-gray-50 sm:px-8"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { popularCourses, recommendedCourses, loading } = useSelector(
    (state: RootState) => state.course
  )

  useEffect(() => {
    dispatch(fetchPopularCourses())
    if (isAuthenticated) {
      dispatch(fetchRecommendedCourses())
    }
  }, [dispatch, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-900">
      <Banner />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Popular Courses Section */}
        <div className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Popular Courses</h2>
            <Link
              to="/courses"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View all courses →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularCourses.slice(0, 6).map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* AI Recommended Courses Section */}
        {isAuthenticated && recommendedCourses.length > 0 && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm text-gray-400">AI-powered recommendations</span>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.slice(0, 3).map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home 