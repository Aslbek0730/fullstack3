import * as React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import { loadGoogleSDK, loadFacebookSDK } from './utils/socialAuth'
import { Toaster } from 'react-hot-toast'
import Chatbot from './components/Chatbot'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Courses from './pages/courses/Courses'
import CourseDetail from './pages/courses/CourseDetail'
import TestPage from './pages/courses/TestPage'
import PaymentSuccess from './pages/PaymentSuccess'
import RewardsPage from './pages/RewardsPage'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  React.useEffect(() => {
    // Load social authentication SDKs
    Promise.all([loadGoogleSDK(), loadFacebookSDK()]).catch((error) => {
      console.error('Failed to load social authentication SDKs:', error)
    })
  }, [])

  return (
    <Provider store={store}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#fff',
          },
        }}
      />
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
            <Route
              path="/payment/success"
              element={
                <PrivateRoute>
                  <PaymentSuccess />
                </PrivateRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <PrivateRoute>
                  <RewardsPage />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      <Chatbot />
    </Provider>
  )
}

export default App 