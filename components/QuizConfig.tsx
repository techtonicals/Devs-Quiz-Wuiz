
import React, { useState, useEffect, useCallback } from 'react';
import { getTopicsForSubject } from '../services/geminiService';
import { SUBJECTS, QUESTION_COUNTS, GRADES, DIFFICULTIES } from '../constants';
import Spinner from './Spinner';
import type { QuizConfig, Difficulty, QuizMode } from '../types';

type QuizCreationMode = 'manual' | 'ai';

interface QuizConfigProps {
  onStartQuiz: (config: QuizConfig) => void;
  onStartQuizWithAi: (prompt: string, numQuestions: number, grade: number, difficulty: Difficulty, mode: QuizMode) => void;
}

const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06zm-6.44 9.06a1.5 1.5 0 100 2.12l.16.16a1.5 1.5 0 002.12 0l4.586-4.586a1.5 1.5 0 000-2.12l-.16-.16a1.5 1.5 0 00-2.12 0L5.03 11.53z" clipRule="evenodd" />
        <path d="M12.24 13.06a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M16.73 4.73a.75.75 0 10-1.06-1.06l-1.5 1.5a.75.75 0 001.06 1.06l1.5-1.5z" />
    </svg>
);

const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.722 2.032a.75.75 0 01.556 0l7.5 4.5a.75.75 0 01-.556 1.382L12 4.618 4.278 7.914a.75.75 0 01-.556-1.382l7.5-4.5z" />
        <path fillRule="evenodd" d="M12 21a8.25 8.25 0 008.25-8.25c0-2.822-1.424-5.34-3.646-6.843l-4.604 2.763-4.604-2.763C5.174 8.41 3.75 10.928 3.75 13.75A8.25 8.25 0 0012 21zm-3.26-4.303a.75.75 0 011.06 0l1.44 1.44a.75.75 0 01-1.06 1.06l-1.44-1.44a.75.75 0 010-1.06zm5.58-.01a.75.75 0 00-1.06 0l-1.44 1.44a.75.75 0 101.06 1.06l1.44-1.44a.75.75 0 000-1.06z" clipRule="evenodd" />
    </svg>
);

const QuizConfig: React.FC<QuizConfigProps> = ({ onStartQuiz, onStartQuizWithAi }) => {
  const [mode, setMode] = useState<QuizCreationMode>('manual');
  const [quizMode, setQuizMode] = useState<QuizMode>('Quiz');
  const [aiPrompt, setAiPrompt] = useState('');
  
  const [grade, setGrade] = useState<number>(GRADES[0]);
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(QUESTION_COUNTS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async (selectedSubject: string, selectedGrade: number) => {
    setLoadingTopics(true);
    setError(null);
    setTopics([]);
    setTopic('');
    try {
      const fetchedTopics = await getTopicsForSubject(selectedSubject, selectedGrade);
      const allTopics = ['All', ...fetchedTopics];
      setTopics(allTopics);
      if (allTopics.length > 0) {
        setTopic(allTopics[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'manual') {
      fetchTopics(subject, grade);
    }
  }, [subject, grade, mode, fetchTopics]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({ grade, subject, topic, numQuestions, difficulty, mode: quizMode });
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      onStartQuizWithAi(aiPrompt, numQuestions, grade, difficulty, quizMode);
    }
  };
  
  const isManualFormReady = !loadingTopics && topic !== '' && topics.length > 0;
  const isAiFormReady = aiPrompt.trim().length > 0;

  const FormLabel: React.FC<{ children: React.ReactNode; htmlFor?: string; }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-md font-bold text-gray-700 mb-2">{children}</label>
  );

  const GradeSelector = (
     <div>
        <FormLabel>Grade Level</FormLabel>
        <div className="grid grid-cols-2 gap-3">
          {GRADES.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGrade(g)}
              className={`py-3 px-4 rounded-xl text-lg font-bold transition-all duration-200 transform hover:-translate-y-1 ${grade === g ? 'bg-yellow-400 text-gray-800 shadow-lg' : 'bg-white text-gray-700 hover:bg-yellow-100 border-2 border-gray-300'}`}
            >
              {g}th Grade
            </button>
          ))}
        </div>
      </div>
  );

  const ModeSelector = (
    <div>
       <FormLabel>Quiz Mode</FormLabel>
       <div className="grid grid-cols-2 gap-3">
         {(['Quiz', 'Practice'] as QuizMode[]).map((m) => (
           <button
             type="button"
             key={m}
             onClick={() => setQuizMode(m)}
             className={`py-3 px-4 rounded-xl text-lg font-bold transition-all duration-200 transform hover:-translate-y-1 ${quizMode === m ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-gray-300'}`}
           >
             {m} Mode
           </button>
         ))}
       </div>
       <p className="text-xs text-gray-500 mt-2 px-1">
         {quizMode === 'Practice' ? 'Practice Mode: Shows feedback and explanations after every question.' : 'Quiz Mode: Shows results only at the very end.'}
       </p>
     </div>
 );

  const QuestionCountSelector = (
     <div>
        <FormLabel>Number of Questions</FormLabel>
        <div className="grid grid-cols-5 gap-2">
          {QUESTION_COUNTS.map((count) => (
            <button
              type="button"
              key={count}
              onClick={() => setNumQuestions(count)}
              className={`py-2 px-2 rounded-lg text-md font-bold transition-all duration-200 transform hover:scale-110 ${numQuestions === count ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-100 border-2 border-gray-300'}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
  );

  const DifficultySelector = (
     <div>
        <FormLabel>Difficulty</FormLabel>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDifficulty(d as Difficulty)}
              className={`py-2 px-4 rounded-lg text-md font-bold transition-all duration-200 transform hover:scale-105 ${difficulty === d ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-purple-100 border-2 border-gray-300'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-2 border-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-blue-600" style={{ textShadow: '2px 2px #a5f3fc' }}>Dev's Quiz Whiz</h1>
        <p className="text-gray-600 mt-2 text-lg">Let's build a super fun quiz!</p>
      </div>
      
      <div className="flex justify-center border-2 border-gray-200 rounded-xl p-1.5 mb-6 bg-blue-100/50 space-x-2">
        <button
          onClick={() => setMode('manual')}
          className={`w-1/2 py-2 rounded-lg font-bold text-lg transition ${mode === 'manual' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
        >
          Pick a Topic
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`w-1/2 py-2 rounded-lg font-bold text-lg transition ${mode === 'ai' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
        >
          Ask AI ✨
        </button>
      </div>

      <div className="mb-6">
        {ModeSelector}
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          {GradeSelector}
          <div>
            <FormLabel htmlFor="subject">Subject</FormLabel>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <FormLabel htmlFor="topic">Topic</FormLabel>
            {loadingTopics ? (
              <div className="flex justify-center p-4"><Spinner message="Finding Fun Topics..." /></div>
            ) : error ? (
              <div className="text-orange-600 bg-orange-100 p-3 rounded-lg border border-orange-200">{error}</div>
            ) : (
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={topics.length === 0}
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-100"
              >
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>

          {QuestionCountSelector}
          {DifficultySelector}
          
          <button
            type="submit"
            disabled={!isManualFormReady}
            className="w-full flex items-center justify-center gap-3 py-4 text-2xl font-black text-white bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            <RocketIcon />
            Start Quiz!
          </button>
        </form>
      ) : (
        <form onSubmit={handleAiSubmit} className="space-y-6">
          {GradeSelector}
          <div>
            <FormLabel htmlFor="ai-prompt">What do you want to learn about?</FormLabel>
            <textarea
              id="ai-prompt"
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., 'fuzzy caterpillars', 'the biggest volcanos', or 'stories about dragons'"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg text-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>
          
          {QuestionCountSelector}
          {DifficultySelector}
          
          <button
            type="submit"
            disabled={!isAiFormReady}
            className="w-full flex items-center justify-center gap-3 py-4 text-2xl font-black text-white bg-orange-500 rounded-xl shadow-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            <MagicWandIcon />
            Make a Magic Quiz!
          </button>
        </form>
      )}
    </div>
  );
};

export default QuizConfig;
