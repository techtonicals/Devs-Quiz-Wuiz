
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface QuizResultsProps {
  score: number;
  quizData: QuizQuestion[];
  userAnswers: (string | null)[];
  onRestart: () => void;
}

const getFeedbackMessage = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage === 100) return "Wow, Perfect Score! You're a Quiz Whiz!";
  if (percentage >= 80) return "Amazing Job! You're a superstar!";
  if (percentage >= 60) return "Great work! You're getting smarter every second!";
  return "Nice try! Keep practicing and you'll be a master!";
};

const CheckIcon = ({ className = "h-6 w-6 text-green-500" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className = "h-6 w-6 text-red-500" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const RefreshIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const QuizResults: React.FC<QuizResultsProps> = ({ score, quizData, userAnswers, onRestart }) => {
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  const toggleExplanation = (index: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-2 border-gray-200 flex flex-col" style={{maxHeight: '95vh'}}>
      {/* Header Section */}
      <div className="p-8 text-center border-b-2 border-gray-200 flex-shrink-0">
        <h1 className="text-4xl font-black text-blue-600">Quiz Complete!</h1>
        <div className="my-6 relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="absolute w-full h-full text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <div className="relative flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white" style={{textShadow: '2px 2px #f59e0b'}}>{score}</span>
                <span className="text-xl font-bold text-white" style={{textShadow: '1px 1px #f59e0b'}}>/ {quizData.length}</span>
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-700">{getFeedbackMessage(score, quizData.length)}</p>
      </div>

      {/* Review Section - Scrollable */}
      <div className="flex-1 overflow-y-auto p-8 bg-blue-50/50">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Let's Review!</h2>
          {quizData.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isExpanded = expandedExplanations[index];

            return (
              <div key={index} className={`p-4 rounded-xl border-2 transition-all duration-300 ${isCorrect ? 'border-green-300 bg-green-100/80' : 'border-red-300 bg-red-100/80'}`}>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mr-3 pt-1">{isCorrect ? <CheckIcon/> : <XIcon/>}</div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-800">{index + 1}. {question.question}</p>
                  </div>
                  <button 
                    onClick={() => toggleExplanation(index)}
                    className={`ml-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-md' : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                  >
                    <InfoIcon />
                    {isExpanded ? 'Hide Why' : 'Explain Why'}
                  </button>
                </div>
                
                <div className="space-y-2 pl-9">
                  {question.options.map((option, optionIndex) => {
                    const isCorrectOption = option === question.correctAnswer;
                    const isUserChoice = option === userAnswer;
                    
                    let optionClasses = "flex items-center w-full text-left p-3 rounded-lg border-2 text-md font-semibold text-gray-800 ";

                    if (isCorrectOption) {
                      optionClasses += "bg-green-200 border-green-400";
                    } else if (isUserChoice && !isCorrectOption) {
                      optionClasses += "bg-red-200 border-red-400 line-through opacity-80";
                    } else {
                      optionClasses += "bg-white border-gray-300 opacity-70";
                    }
                    
                    return (
                      <div key={optionIndex} className={optionClasses}>
                        <span className="flex-1">{option}</span>
                        {isCorrectOption && <CheckIcon className="h-5 w-5 text-green-600" />}
                        {isUserChoice && !isCorrectOption && <XIcon className="h-5 w-5 text-red-600" />}
                      </div>
                    );
                  })}

                  {isExpanded && (
                    <div className="mt-4 p-4 bg-white/60 border-2 border-blue-200 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-gray-700 font-bold leading-relaxed">
                            <span className="text-blue-600 font-black mr-2">Explanation:</span>
                            {question.explanation}
                        </p>
                    </div>
                  )}

                  {!isCorrect && userAnswer === null && (
                    <p className="mt-2 text-sm text-orange-700 font-semibold">You didn't answer this one.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="p-6 border-t-2 border-gray-200 flex-shrink-0 bg-white/50">
        <button
          onClick={onRestart}
          className="w-full py-4 text-2xl font-black text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
            <RefreshIcon />
            Play Again!
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
