import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchUserRewards,
  fetchRecommendations,
  selectRewards,
  selectRecommendations,
  selectLoading,
  selectError,
} from '../../store/slices/rewardSlice';
import { clearError } from '../../store/slices/rewardSlice';

const RewardsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rewards = useSelector(selectRewards);
  const recommendations = useSelector(selectRecommendations);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchUserRewards());
    dispatch(fetchRecommendations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // You might want to show this error in a toast or alert
      console.error('Rewards error:', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (loading) {
    return <div>Loading rewards and recommendations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rewards Section */}
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
                  <p className="text-sm text-gray-500">
                    Awarded: {new Date(reward.awarded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Personalised Recommendations</h2>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {recommendation.course_title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Difficulty: {recommendation.difficulty_level}
                  </p>
                  <p className="mt-2 text-gray-700">{recommendation.reason}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded">
                    {Math.round(recommendation.confidence_score * 100)}% Match
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsDashboard; 