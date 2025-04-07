import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../store'
import { Course } from '../store/slices/courseSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import PaymentModal from './PaymentModal'

interface CourseCardProps {
  course: Course
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleCourseClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${course.id}` } })
      return
    }

    if (!course.isPurchased && course.price > 0) {
      setShowPaymentModal(true)
    } else {
      navigate(`/courses/${course.id}`)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    navigate(`/courses/${course.id}`)
  }

  return (
    <>
      <div
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-gray-900 shadow-lg transition-transform hover:-translate-y-1"
        onClick={handleCourseClick}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {course.isPurchased && (
            <div className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
              Purchased
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 text-lg font-semibold text-white">{course.title}</h3>
          <p className="mb-4 flex-1 text-sm text-gray-400 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="h-6 w-6 rounded-full"
              />
              <span className="text-sm text-gray-400">{course.instructor.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-4.146 2.18a1 1 0 01-1.45-1.054l.793-4.617-3.353-3.267a1 1 0 01.554-1.705l4.628-.673L9.07 2.197a1 1 0 011.86 0l2.044 4.152 4.628.673a1 1 0 01.554 1.705l-3.353 3.267.793 4.617a1 1 0 01-1.45 1.054L10 15.585z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm text-gray-400">{course.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-400">
                {course.totalStudents.toLocaleString()} students
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-400">
              {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
            </span>
            <button
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                course.isPurchased
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : course.price > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleCourseClick()
              }}
            >
              {course.isPurchased ? 'Continue Learning' : course.price > 0 ? 'Buy Now' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          courseId={course.id}
          courseTitle={course.title}
          price={course.price}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

export default CourseCard 