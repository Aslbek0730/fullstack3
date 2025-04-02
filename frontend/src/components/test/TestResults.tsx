import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchTestResults,
  selectCurrentSubmission,
  selectUserRewards,
  selectLoading,
  selectError,
} from '../../store/slices/testSlice';

interface TestResultsProps {
  testId: number;
}

const TestResults: React.FC<TestResultsProps> = ({ testId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const submission = useSelector(selectCurrentSubmission);
  const rewards = useSelector(selectUserRewards);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchTestResults(testId));
  }, [dispatch, testId]);

  if (loading) {
    return <div>Loading results...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!submission) {
    return <div>No submission found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Test Results</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {submission.score}/{submission.test.max_score}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold">Status</p>
              <p className={`text-xl font-semibold ${
                submission.status === 'graded' ? 'text-green-600' : 'text-red-600'
              }`}>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">AI Feedback</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{submission.ai_feedback}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Question Details</h3>
          {submission.question_submissions.map((qSubmission) => (
            <div key={qSubmission.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{qSubmission.question.question_text}</p>
                <span className={`px-2 py-1 rounded text-sm ${
                  qSubmission.score === qSubmission.question.points
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {qSubmission.score}/{qSubmission.question.points} points
                </span>
              </div>
              {qSubmission.ai_feedback && (
                <p className="text-sm text-gray-600 mt-2">{qSubmission.ai_feedback}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {rewards.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  {reward.reward_type === 'points' && (
                    <span className="text-2xl">🎯</span>
                  )}
                  {reward.reward_type === 'badge' && (
                    <span className="text-2xl">🏆</span>
                  )}
                  {reward.reward_type === 'certificate' && (
                    <span className="text-2xl">📜</span>
                  )}
                  <div>
                    <p className="font-semibold capitalize">{reward.reward_type}</p>
                    <p className="text-gray-600">{reward.reward_value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults; 