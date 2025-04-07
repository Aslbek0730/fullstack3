import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AppDispatch, RootState } from '../../store'
import { fetchCourses } from '../../store/slices/courseSlice'

interface Course {
  id: number;
  title: string;
  subtitle: string;
  logo: string;
}

const CourseCard: React.FC<Course> = ({ title, subtitle, logo }) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 p-6 transition-all duration-300 hover:scale-105">
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-center">
          <img src={logo} alt={title} className="h-24 w-24 object-contain" />
        </div>
        <div className="mt-auto text-center">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-gray-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const Courses: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { courses, loading, error } = useSelector(
    (state: RootState) => state.courses
  )

  useEffect(() => {
    dispatch(fetchCourses())
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-12 text-4xl font-bold text-white">Kurslar</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard 
            key={course.id}
            id={course.id}
            title={course.title}
            subtitle={course.description}
            logo={course.thumbnail}
          />
        ))}
      </div>
    </div>
  )
}

export default Courses 