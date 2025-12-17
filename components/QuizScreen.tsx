
import React, { useState } from 'react';
import type { QuizQuestion, QuizMode } from '../types';

interface QuizScreenProps {
  quizData: QuizQuestion[];
  quizTopic: string;
  quizMode: QuizMode;
  onFinishQuiz: (answers: (string | null)[]) => void;
}

const RightArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const QuizScreen: React.FC<QuizScreenProps> = ({ quizData, quizTopic, quizMode, onFinishQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quizData.length).fill(null));
  const [showFeedback, setShowFeedback] = useState(false);
  
  const currentQuestion = quizData[currentQuestionIndex];
  const isPractice = quizMode === 'Practice';
  const hasAnsweredCurrent = selectedAnswers[currentQuestionIndex] !== null;
  
  const handleAnswerSelect = (option: string) => {
    // In practice mode, don't allow changing answer once feedback is shown
    if (isPractice && showFeedback) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);

    if (isPractice) {
        setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    } else {
      onFinishQuiz(selectedAnswers);
    }
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / quizData.length) * 100;
  const userAnswer = selectedAnswers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;

  return (
    <div className="w-full max-w-[1920px] lg:w-[98vw] min-h-[85vh] mx-auto bg-white p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-2 border-gray-200 transition-all duration-300 flex flex-col justify-between">
      <div className="mb-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-blue-800 capitalize">{quizTopic}</h2>
             <span className={`text-xs px-2 py-0.5 rounded-full font-black uppercase ${isPractice ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {quizMode} Mode
             </span>
          </div>
          <p className="text-lg font-bold text-gray-600">Question {currentQuestionIndex + 1}/{quizData.length}</p>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-4 border-2 border-blue-200">
          <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      <div className="mb-6 flex-grow flex flex-col items-center justify-center">
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-snug text-center px-4 mb-8">
            {currentQuestion.question}
        </p>

        {isPractice && showFeedback && (
            <div className={`w-full max-w-4xl p-6 rounded-2xl border-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-full ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {isCorrect ? <CheckCircleIcon /> : <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>}
                    </div>
                    <h3 className={`text-2xl font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? 'Correct!' : 'Almost!'}
                    </h3>
                </div>
                <div className="flex gap-3 text-lg font-bold text-gray-700">
                    <div className="mt-1 flex-shrink-0"><InfoIcon /></div>
                    <p>{currentQuestion.explanation}</p>
                </div>
            </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;
              
              let buttonClasses = "w-full text-left p-6 rounded-xl border-4 transition-all duration-200 ease-in-out transform flex items-center text-2xl font-semibold ";
              let spanClasses = "inline-block mr-4 font-black text-2xl px-4 py-2 rounded-lg flex-shrink-0 ";

              if (isPractice && showFeedback) {
                  if (isCorrectAnswer) {
                      buttonClasses += "bg-green-500 border-green-600 text-white shadow-lg ";
                      spanClasses += "bg-white text-green-600";
                  } else if (isSelected && !isCorrectAnswer) {
                      buttonClasses += "bg-red-500 border-red-600 text-white shadow-lg ";
                      spanClasses += "bg-white text-red-600";
                  } else {
                      buttonClasses += "bg-gray-100 border-gray-200 text-gray-400 opacity-50 ";
                      spanClasses += "bg-gray-200 text-gray-400";
                  }
              } else {
                  if (isSelected) {
                    buttonClasses += "bg-blue-500 border-blue-600 text-white shadow-lg -translate-y-1 ";
                    spanClasses += "bg-white text-blue-600";
                  } else {
                    buttonClasses += "bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-1 ";
                    spanClasses += "bg-blue-100 text-blue-700";
                  }
              }

              return (
                <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isPractice && showFeedback}
                    className={buttonClasses}
                >
                    <span className={spanClasses}>
                    {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                </button>
              );
            })}
        </div>
        
        <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="w-full py-5 text-2xl font-black text-white bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-1"
        >
            {currentQuestionIndex < quizData.length - 1 ? 
            (<><span>Next Question</span><RightArrowIcon/></>) : 
            (<><span>Finish Quiz!</span><CheckCircleIcon/></>)
            }
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;
