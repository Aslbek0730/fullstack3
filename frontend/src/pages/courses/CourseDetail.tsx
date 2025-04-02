import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AppDispatch, RootState } from '../../store/store'
import PaymentForm from '../../components/payment/PaymentForm'
import {
  fetchCourseDetails,
  selectCurrentCourse,
  selectLoading,
  selectError,
} from '../../store/slices/courseSlice'

const CourseDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { courseId } = useParams<{ courseId: string }>()
  const course = useSelector(selectCurrentCourse)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseDetails(parseInt(courseId)))
    }
  }, [dispatch, courseId])

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

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Course not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <img
                    src={course.instructor.avatar || '/images/default-avatar.png'}
                    alt={course.instructor.username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-gray-700">
                    {course.instructor.first_name} {course.instructor.last_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-gray-600">{course.rating}</span>
                </div>
                <div className="text-gray-600">
                  {course.enrolled_students} students enrolled
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <PaymentForm
                courseId={course.id}
                coursePrice={course.price}
                onSuccess={() => {
                  // Handle successful purchase
                  window.location.href = `/courses/${course.id}/learn`
                }}
                onError={(error) => {
                  // Handle payment error
                  console.error('Payment error:', error)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* What You'll Learn */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                {course.objectives.split('\n').map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </section>

            {/* Course Syllabus */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Course Syllabus</h2>
              <div className="space-y-4">
                {course.syllabus.map((section, index) => (
                  <div key={index} className="border-b pb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      Section {index + 1}: {section.title}
                    </h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-3">
                {course.requirements.split('\n').map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Course Info Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium ml-2">{course.duration}</span>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium ml-2">{course.level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium ml-2">{course.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium ml-2">{course.view_count}</span>
                </div>
                <div className="pt-4 border-t">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-blue-600 ml-2">
                    ${course.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail 