
import React, { useState } from 'react';
import QuizConfig from './components/QuizConfig';
import QuizScreen from './components/QuizScreen';
import QuizResults from './components/QuizResults';
import Spinner from './components/Spinner';
import { generateQuiz, generateQuizFromPrompt } from './services/geminiService';
import type { QuizConfig as QuizConfigType, QuizQuestion, Difficulty, QuizMode } from './types';

type Screen = 'config' | 'quiz' | 'results';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('config');
  const [quizConfig, setQuizConfig] = useState<QuizConfigType | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async (config: QuizConfigType) => {
    setIsLoading(true);
    setError(null);
    setQuizConfig(config);
    try {
      const questions = await generateQuiz(config.subject, config.topic, config.numQuestions, config.grade, config.difficulty);
      if (questions.length < config.numQuestions) {
        throw new Error(`The model could only generate ${questions.length} questions. Please try a different topic.`);
      }
      setQuizData(questions);
      setScreen('quiz');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setScreen('config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuizWithAi = async (prompt: string, numQuestions: number, grade: number, difficulty: Difficulty, mode: QuizMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const { topic, questions } = await generateQuizFromPrompt(prompt, numQuestions, grade, difficulty);
      if (questions.length < numQuestions) {
        throw new Error(`The model could only generate ${questions.length} questions. Please try a different topic.`);
      }
      setQuizData(questions);
      setQuizConfig({
        grade,
        subject: 'AI Generated',
        topic,
        numQuestions,
        difficulty,
        mode
      });
      setScreen('quiz');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setScreen('config');
    } finally {
      setIsLoading(false);
    }
  };


  const handleFinishQuiz = (answers: (string | null)[]) => {
    let currentScore = 0;
    quizData.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setUserAnswers(answers);
    setScreen('results');
  };

  const handleRestart = () => {
    setScreen('config');
    setQuizData([]);
    setUserAnswers([]);
    setScore(0);
    setError(null);
    setQuizConfig(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner message="Building your quiz..." />;
    }
    if (error && screen === 'config') {
      return (
        <div>
          <QuizConfig onStartQuiz={handleStartQuiz} onStartQuizWithAi={handleStartQuizWithAi} />
          <div className="w-full max-w-2xl mx-auto mt-4 p-4 bg-orange-100 text-orange-800 rounded-lg shadow-md border border-orange-200">
            <strong>Oops!</strong> {error}
          </div>
        </div>
      );
    }
    
    switch (screen) {
      case 'quiz':
        return (
            <QuizScreen 
                quizData={quizData} 
                quizTopic={quizConfig?.topic || ''} 
                quizMode={quizConfig?.mode || 'Quiz'}
                onFinishQuiz={handleFinishQuiz} 
            />
        );
      case 'results':
        return <QuizResults score={score} quizData={quizData} userAnswers={userAnswers} onRestart={handleRestart} />;
      case 'config':
      default:
        return <QuizConfig onStartQuiz={handleStartQuiz} onStartQuizWithAi={handleStartQuizWithAi} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
};

export default App;
