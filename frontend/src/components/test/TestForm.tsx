import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchTest,
  submitTest,
  selectCurrentTest,
  selectLoading,
  selectError,
} from '../../store/slices/testSlice';
import { clearError } from '../../store/slices/testSlice';

interface TestFormProps {
  testId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const TestForm: React.FC<TestFormProps> = ({ testId, onSuccess, onError }) => {
  const dispatch = useDispatch<AppDispatch>();
  const test = useSelector(selectCurrentTest);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  useEffect(() => {
    dispatch(fetchTest(testId));
  }, [dispatch, testId]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissions = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      ...answer,
    }));

    const result = await dispatch(submitTest({ testId, submissions }));
    
    if (submitTest.fulfilled.match(result)) {
      onSuccess?.();
    } else {
      onError?.(result.error.message || 'Failed to submit test');
    }
  };

  if (loading) {
    return <div>Loading test...</div>;
  }

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{test.title}</h2>
        <p className="text-gray-600 mb-6">{test.description}</p>

        {test.questions.map((question) => (
          <div key={question.id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
            <p className="text-sm text-gray-500 mb-4">Points: {question.points}</p>

            {question.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label key={choice.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={answers[question.id]?.selected_choice_ids?.includes(choice.id)}
                      onChange={(e) => {
                        const current = answers[question.id]?.selected_choice_ids || [];
                        const newChoices = e.target.checked
                          ? [...current, choice.id]
                          : current.filter((id: number) => id !== choice.id);
                        handleAnswerChange(question.id, { selected_choice_ids: newChoices });
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'true_false' && (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <label key={choice.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id]?.selected_choice_ids?.[0] === choice.id}
                      onChange={() => {
                        handleAnswerChange(question.id, {
                          selected_choice_ids: [choice.id],
                        });
                      }}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span>{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'short_answer' && (
              <textarea
                value={answers[question.id]?.answer_text || ''}
                onChange={(e) => {
                  handleAnswerChange(question.id, { answer_text: e.target.value });
                }}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Enter your answer..."
              />
            )}

            {question.question_type === 'programming' && (
              <div className="space-y-4">
                <textarea
                  value={answers[question.id]?.answer_text || ''}
                  onChange={(e) => {
                    handleAnswerChange(question.id, { answer_text: e.target.value });
                  }}
                  className="w-full p-2 border rounded-md font-mono"
                  rows={10}
                  placeholder="Enter your code..."
                />
                <div className="text-sm text-gray-500">
                  <p>Expected output:</p>
                  <pre className="bg-gray-100 p-2 rounded">
                    {question.choices[0]?.choice_text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TestForm; 