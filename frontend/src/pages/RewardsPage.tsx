import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import {
  fetchRewards,
  fetchRecommendations,
  claimReward,
  selectRewards,
  selectRecommendations,
  selectRewardLoading,
  selectRewardError,
} from '../store/slices/rewardSlice'
import { toast } from 'react-hot-toast'

const RewardsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const rewards = useSelector(selectRewards)
  const recommendations = useSelector(selectRecommendations)
  const loading = useSelector(selectRewardLoading)
  const error = useSelector(selectRewardError)

  useEffect(() => {
    dispatch(fetchRewards())
    dispatch(fetchRecommendations())
  }, [dispatch])

  const handleClaimReward = async (rewardId: number) => {
    try {
      await dispatch(claimReward(rewardId)).unwrap()
      toast.success('Reward claimed successfully!')
    } catch (error) {
      toast.error('Failed to claim reward')
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

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Rewards & Recommendations</h1>
          <p className="mt-2 text-gray-400">
            Track your achievements and discover personalized learning opportunities
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Rewards Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Your Rewards</h2>
            {rewards.length === 0 ? (
              <p className="text-gray-400">No rewards yet. Keep learning to earn rewards!</p>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="rounded-lg bg-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{reward.title}</h3>
                        <p className="text-gray-400">{reward.description}</p>
                      </div>
                      <button
                        onClick={() => handleClaimReward(reward.id)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                      >
                        Claim
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                      <span>Value: {reward.value}</span>
                      <span>Awarded: {new Date(reward.awardedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">AI Recommendations</h2>
            {recommendations.length === 0 ? (
              <p className="text-gray-400">
                Complete more tests to receive personalized recommendations
              </p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="rounded-lg bg-gray-700 p-4"
                  >
                    <div className="mb-2">
                      <h3 className="text-lg font-medium text-white">{recommendation.title}</h3>
                      <p className="text-gray-400">{recommendation.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          recommendation.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : recommendation.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {recommendation.difficulty}
                      </span>
                      <span className="text-gray-400">
                        Confidence: {Math.round(recommendation.score * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{recommendation.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RewardsPage 