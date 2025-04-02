import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import {
  fetchPopularCourses,
  fetchRecommendedCourses,
  selectPopularCourses,
  selectRecommendedCourses,
  selectLoading,
  selectError,
} from '../store/slices/courseSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'

interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  price: number
  instructor: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  category: string
  level: string
  duration: string
  rating: number
  enrolled_students: number
  is_enrolled: boolean
  view_count: number
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const popularCourses = useSelector(selectPopularCourses)
  const recommendedCourses = useSelector(selectRecommendedCourses)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchPopularCourses())
    if (isAuthenticated) {
      dispatch(fetchRecommendedCourses())
    }
  }, [dispatch, isAuthenticated])

  const handleCourseClick = (courseId: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } })
    } else {
      navigate(`/courses/${courseId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Shams Academy
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover the best courses and enhance your skills
          </p>
          <Link
            to="/courses"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Popular Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course: Course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCourseClick(course.id)}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">
                      ${course.price}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Courses Section (Only for authenticated users) */}
      {isAuthenticated && recommendedCourses.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course: Course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">
                        ${course.price}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-gray-600">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who are already learning with us
          </p>
          <Link
            to={isAuthenticated ? '/courses' : '/register'}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {isAuthenticated ? 'Browse All Courses' : 'Get Started'}
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home 