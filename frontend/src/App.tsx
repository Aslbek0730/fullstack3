import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import { loadGoogleSDK, loadFacebookSDK } from './utils/socialAuth'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Courses from './pages/courses/Courses'
import CourseDetail from './pages/courses/CourseDetail'
import TestPage from './pages/courses/TestPage'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const App: React.FC = () => {
  useEffect(() => {
    // Load social authentication SDKs
    Promise.all([loadGoogleSDK(), loadFacebookSDK()]).catch((error) => {
      console.error('Failed to load social authentication SDKs:', error)
    })
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="dashboard"
              element={
                <PrivateRoute>
                  <div>Dashboard (Coming Soon)</div>
                </PrivateRoute>
              }
            />
            <Route
              path="/courses/:courseId/tests/:testId"
              element={
                <PrivateRoute>
                  <TestPage />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App 