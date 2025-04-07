import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import {
  fetchTest,
  submitTest,
  submitCodeExercise,
  selectCurrentTest,
  selectTestLoading,
  selectTestError,
  selectSubmissionStatus,
  selectAIFeedback,
  clearTest,
} from '../store/slices/testSlice'
import CodeEditor from '../components/CodeEditor'
import { toast } from 'react-hot-toast'

const TestPage = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const test = useSelector(selectCurrentTest)
  const loading = useSelector(selectTestLoading)
  const error = useSelector(selectTestError)
  const submissionStatus = useSelector(selectSubmissionStatus)
  const aiFeedback = useSelector(selectAIFeedback)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [code, setCode] = useState('')

  useEffect(() => {
    if (testId) {
      dispatch(fetchTest(parseInt(testId)))
    }
    return () => {
      dispatch(clearTest())
    }
  }, [dispatch, testId])

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
  }

  const handleSubmit = async () => {
    if (!test) return

    const currentQuestion = test.questions[currentQuestionIndex]
    if (currentQuestion.type === 'code') {
      try {
        await dispatch(
          submitCodeExercise({
            testId: test.id,
            code,
          })
        ).unwrap()
        toast.success('Code submitted successfully!')
      } catch (error) {
        toast.error('Failed to submit code')
      }
    } else {
      try {
        await dispatch(
          submitTest({
            testId: test.id,
            answers,
          })
        ).unwrap()
        toast.success('Test submitted successfully!')
        navigate(`/courses/${test.courseId}`)
      } catch (error) {
        toast.error('Failed to submit test')
      }
    }
  }

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setCode('')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!test) {
    return null
  }

  const currentQuestion = test.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{test.title}</h1>
          <p className="mt-2 text-gray-400">{test.description}</p>
        </div>

        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </h2>
            {test.timeLimit && (
              <div className="text-gray-400">
                Time remaining: {test.timeLimit} minutes
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-lg text-white">{currentQuestion.question}</p>
          </div>

          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-4">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg bg-gray-700 p-4 hover:bg-gray-600"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'code' && (
            <div className="space-y-4">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                language="javascript"
                height="400px"
              />
              {currentQuestion.testCases && (
                <div className="mt-4">
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Test Cases
                  </h3>
                  <div className="space-y-2">
                    {currentQuestion.testCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-700 p-4"
                      >
                        <p className="text-gray-400">
                          Input: {testCase.input}
                        </p>
                        <p className="text-gray-400">
                          Expected Output: {testCase.expectedOutput}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {aiFeedback && (
            <div className="mt-6 rounded-lg bg-gray-700 p-4">
              <h3 className="mb-2 text-lg font-semibold text-white">
                AI Feedback
              </h3>
              {aiFeedback.codeReview && (
                <p className="text-gray-300">{aiFeedback.codeReview}</p>
              )}
              {aiFeedback.suggestions && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-gray-400">
                    Suggestions:
                  </h4>
                  <ul className="list-inside list-disc text-gray-300">
                    {aiFeedback.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiFeedback.score !== undefined && (
                <div className="mt-2">
                  <p className="text-gray-300">
                    Score: {aiFeedback.score}%
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="rounded-lg bg-gray-700 px-4 py-2 text-white disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestionIndex < test.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submissionStatus === 'submitting'}
                className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage 