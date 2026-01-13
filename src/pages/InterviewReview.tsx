import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Shuffle, List, ChevronRight, ChevronUp, Search, X, Info } from 'lucide-react';
import MarkdownText from '../components/MarkdownText';
import AnswerModal from '../components/AnswerModal';

interface Question {
  id: number;
  level: string;
  question: string;
  short_answer: string;
  answer?: string; // Full detailed answer
  look_for?: string;
}

type RoleLevel = 'all' | 'junior' | 'mid' | 'senior';

const InterviewReview = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<'random' | 'full'>('random');
  const [roleLevel, setRoleLevel] = useState<RoleLevel>('all');
  const [limit, setLimit] = useState(10);
  const [limitInput, setLimitInput] = useState('10');
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load questions from JSON
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('./content/question.json');
        const data: Question[] = await response.json();
        setAllQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Get questions for selected role level
  const getQuestionsForRole = useCallback((): Question[] => {
    let questions = roleLevel === 'all' 
      ? allQuestions 
      : allQuestions.filter(q => q.level === roleLevel);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(query) ||
        q.short_answer.toLowerCase().includes(query) ||
        (q.answer && q.answer.toLowerCase().includes(query)) ||
        (q.look_for && q.look_for.toLowerCase().includes(query))
      );
    }

    return questions;
  }, [roleLevel, allQuestions, searchQuery]);

  // Update display questions based on mode and limit
  const updateDisplayQuestions = useCallback(() => {
    let result = getQuestionsForRole();

    if (mode === 'random' && !searchQuery.trim()) {
      // Shuffle and limit only when not searching
      const shuffled = [...result].sort(() => Math.random() - 0.5);
      result = shuffled.slice(0, limit);
      setExpandedAnswers(new Set());
    } else {
      // Full mode or searching - show all matching results
      setExpandedAnswers(new Set());
    }

    setDisplayQuestions(result);
  }, [getQuestionsForRole, mode, searchQuery, limit]);

  // Update display questions when role level, mode, limit, or search changes
  useEffect(() => {
    if (!loading && allQuestions.length > 0) {
      updateDisplayQuestions();
    }
  }, [loading, allQuestions, updateDisplayQuestions]);

  // Handle mode change
  const handleModeChange = (newMode: 'random' | 'full') => {
    setMode(newMode);
  };

  // Handle role level change
  const handleRoleLevelChange = (newRoleLevel: RoleLevel) => {
    setRoleLevel(newRoleLevel);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  // Handle limit blur
  const handleLimitBlur = () => {
    const value = parseInt(limitInput);
    if (isNaN(value) || value < 1) {
      setLimitInput(limit.toString());
    } else {
      handleLimitChange(value);
    }
  };

  // Toggle answer visibility
  const toggleAnswer = (index: number) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Open answer detail modal
  const openAnswerModal = (question: Question) => {
    setModalQuestion(question);
  };

  // Close answer detail modal
  const closeAnswerModal = () => {
    setModalQuestion(null);
  };

  const totalQuestions = getQuestionsForRole().length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Interview Review
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prepare for interviews by reviewing questions and answers
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, answers..."
            className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Level Dropdown */}
          <select
            value={roleLevel}
            onChange={(e) => handleRoleLevelChange(e.target.value as RoleLevel)}
            className="px-3 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Levels</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>

          <div className="h-4 w-px bg-gray-300 dark:bg-neutral-700"></div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-neutral-800 rounded p-0.5">
            <button
              onClick={() => handleModeChange('random')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                mode === 'random'
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Random
            </button>
            <button
              onClick={() => handleModeChange('full')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                mode === 'full'
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              All
            </button>
          </div>

          {/* Limit Input (only for random mode and not searching) */}
          {mode === 'random' && !searchQuery.trim() && (
            <>
              <div className="h-4 w-px bg-gray-300 dark:bg-neutral-700"></div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Limit:
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  onBlur={handleLimitBlur}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-xs"
                />
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  of {totalQuestions}
                </span>
              </div>
            </>
          )}

          <div className="ml-auto text-xs font-medium text-gray-900 dark:text-white">
            {searchQuery.trim() ? (
              <span>
                {displayQuestions.length} result{displayQuestions.length !== 1 ? 's' : ''} found
              </span>
            ) : (
              <span>
                {displayQuestions.length} {mode === 'random' ? 'questions' : 'total'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {displayQuestions.length > 0 ? (
        <div className="space-y-2">
          {displayQuestions.map((question, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-neutral-800 rounded p-3 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-neutral-900"
            >
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase">Question {index + 1}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{question.question}</p>
              </div>

              {expandedAnswers.has(index) ? (
                <div className="mt-2">
                  <button
                    onClick={() => toggleAnswer(index)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 mb-2"
                  >
                    <ChevronUp size={14} />
                    Hide Answer
                  </button>
                  
                  {/* Short Answer - Clickable to open modal */}
                  <div 
                    onClick={() => question.answer && question.answer !== question.short_answer && openAnswerModal(question)}
                    className={`text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-neutral-800 border border-blue-200 dark:border-neutral-700 rounded p-3 ${
                      question.answer && question.answer !== question.short_answer 
                        ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-neutral-700 transition-colors' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-medium text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-wide flex items-center gap-1">
                        Quick Answer
                        {question.answer && question.answer !== question.short_answer && (
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 normal-case">(click for details)</span>
                        )}
                      </div>
                      {question.answer && question.answer !== question.short_answer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAnswerModal(question);
                          }}
                          className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                          title="View detailed explanation"
                        >
                          <Info size={14} className="text-purple-600 dark:text-purple-400" />
                        </button>
                      )}
                    </div>
                    <MarkdownText text={question.short_answer} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => toggleAnswer(index)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <ChevronRight size={14} />
                  Show Answer
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 border border-gray-200 dark:border-neutral-800 rounded-lg bg-gray-50 dark:bg-neutral-900/50">
          {searchQuery.trim() ? (
            <>
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No results found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try a different search term or clear the search
              </p>
            </>
          ) : (
            <>
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No questions to display
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try selecting a different role level or mode
              </p>
            </>
          )}
        </div>
      )}

      {/* Answer Detail Modal */}
      <AnswerModal
        isOpen={modalQuestion !== null}
        onClose={closeAnswerModal}
        question={modalQuestion?.question || ''}
        answer={modalQuestion?.answer || modalQuestion?.short_answer || ''}
        title="Detailed Answer"
      />
    </div>
  );
};

export default InterviewReview;