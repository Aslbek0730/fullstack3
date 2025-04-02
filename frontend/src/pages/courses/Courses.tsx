import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../../store'
import { setCourses } from '../../store/slices/courseSlice'

export default function Courses() {
  const dispatch = useDispatch()
  const { courses, loading, error } = useSelector(
    (state: RootState) => state.courses
  )

  useEffect(() => {
    // TODO: Fetch courses from API
    const fetchCourses = async () => {
      try {
        // Simulated API response
        const response = {
          courses: [
            {
              id: 1,
              title: 'Introduction to Programming',
              description: 'Learn the basics of programming',
              price: 49.99,
              instructor: 'John Doe',
              thumbnail: '/course-1.jpg',
              rating: 4.5,
              enrolledStudents: 1234,
              category: 'Programming',
              level: 'Beginner',
              duration: '6 weeks',
            },
            {
              id: 2,
              title: 'Web Development Bootcamp',
              description: 'Comprehensive web development course',
              price: 99.99,
              instructor: 'Jane Smith',
              thumbnail: '/course-2.jpg',
              rating: 4.8,
              enrolledStudents: 2345,
              category: 'Web Development',
              level: 'Intermediate',
              duration: '12 weeks',
            },
            // Add more courses...
          ],
        }

        dispatch(setCourses(response.courses))
      } catch (err) {
        console.error('Error fetching courses:', err)
      }
    }

    fetchCourses()
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg font-semibold">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Available Courses
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              Browse our selection of courses taught by industry experts
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Filter Courses
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div className="flex-shrink-0">
                <img
                  className="h-48 w-full object-cover"
                  src={course.thumbnail}
                  alt={course.title}
                />
              </div>
              <div className="flex flex-1 flex-col justify-between bg-white p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-600">
                    {course.category}
                  </p>
                  <Link to={`/courses/${course.id}`} className="mt-2 block">
                    <p className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500">
                      {course.description}
                    </p>
                  </Link>
                </div>
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src="/default-avatar.png"
                        alt={course.instructor}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {course.instructor}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{course.duration}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ${course.price}
                    </span>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.934l-6.18 3.25.918-7.47L.246 7.566l7.48-1.09L10 0l2.274 6.476 7.48 1.09-4.492 4.148.918 7.47L10 15.934z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-1 text-sm text-gray-500">
                        {course.rating} ({course.enrolledStudents} students)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 