import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TestForm from '../../components/test/TestForm';
import TestResults from '../../components/test/TestResults';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { selectCurrentSubmission } from '../../store/slices/testSlice';

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const submission = useSelector(selectCurrentSubmission);
  const [showResults, setShowResults] = useState(false);

  if (!testId) {
    return <div>Invalid test ID</div>;
  }

  const handleTestSuccess = () => {
    setShowResults(true);
  };

  const handleTestError = (error: string) => {
    // You might want to show this error in a toast or alert
    console.error('Test submission error:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!showResults && !submission ? (
        <TestForm
          testId={parseInt(testId)}
          onSuccess={handleTestSuccess}
          onError={handleTestError}
        />
      ) : (
        <TestResults testId={parseInt(testId)} />
      )}
    </div>
  );
};

export default TestPage; 