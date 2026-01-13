import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Shuffle, ChevronDown, ChevronRight, Save, AlertTriangle, Briefcase, Info } from 'lucide-react';
import AnswerModal from '../components/AnswerModal';

const Interview = () => {
  const [candidateName, setCandidateName] = useState('');
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewerName, setInterviewerName] = useState('');
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('androidInterviewSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.selectedTemplate || 'junior';
      } catch (e) {
        return 'junior';
      }
    }
    return 'junior';
  });
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(() => {
    const saved = localStorage.getItem('androidInterviewCurrentDraftId');
    return saved ? parseInt(saved) : null;
  });
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [maxQuestionsPerCategory, setMaxQuestionsPerCategory] = useState(() => {
    const saved = localStorage.getItem('androidInterviewSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.maxQuestionsPerCategory || 2;
      } catch (e) {
        return 2;
      }
    }
    return 2;
  });
  const [maxTotalQuestions, setMaxTotalQuestions] = useState(() => {
    const saved = localStorage.getItem('androidInterviewSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.maxTotalQuestions || 18;
      } catch (e) {
        return 18;
      }
    }
    return 18;
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [scores, setScores] = useState({});
  const [overallNotes, setOverallNotes] = useState('');
  const [decision, setDecision] = useState('');
  const [showAnswers, setShowAnswers] = useState({});
  const [answerModalData, setAnswerModalData] = useState(null);
  const [jsonQuestions, setJsonQuestions] = useState({});

  

  const [allQuestions, setAllQuestions] = useState(() => {
    const saved = localStorage.getItem('androidInterviewQuestions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = {};
        for (const cat in parsed) {
          migrated[cat] = parsed[cat].map(q =>
            typeof q === 'string' ? { question: q, shortAnswer: '', lookFor: '' } : q
          );
        }
        return migrated;
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('androidInterviewQuestions', JSON.stringify(allQuestions));
  }, [allQuestions]);

  const categoryLabels = {
    compose: 'Compose',
    android: 'Android',
    kotlin: 'Kotlin',
    coroutines: 'Coroutines',
    network: 'Network',
    architecture: 'Architecture',
    firebase: 'Firebase',
    tools: 'Tools',
    project: 'Project'
  };

  // Load questions from JSON based on role
  useEffect(() => {
    // Load HRD-Junior questions from separate file, others from main question bank
    const questionFile = role === 'hrd-junior' ? '/content/hrd-junior.json' : '/content/questions.json';
    
    fetch(questionFile)
      .then(res => res.json())
      .then(data => {
        if (role === 'hrd-junior') {
          // HRD-Junior format: { metadata, categories }
          setJsonQuestions({ 'hrd-junior': data.categories || {} });
        } else {
          // Main question bank format
          const { _metadata, ...questions } = data;
          setJsonQuestions(questions || {});
        }
      })
      .catch(err => {
        console.error('Failed to load questions:', err);
      });
  }, [role]); // Reload when role changes

  const getRandomQuestions = () => {
    const selected = [];
    const cats = Object.keys(allQuestions);
    cats.forEach(cat => {
      const qs = [...allQuestions[cat]].sort(() => 0.5 - Math.random()).slice(0, maxQuestionsPerCategory);
      qs.forEach(q => selected.push({ category: cat, ...q }));
    });

    // Shuffle all questions and limit by maxTotalQuestions
    selected.sort(() => 0.5 - Math.random());
    const finalSelected = selected.slice(0, maxTotalQuestions);

    setSelectedQuestions(finalSelected);
    setScores({});
    setShowAnswers({});
  };

  const toggleAnswer = (index) => {
    setShowAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const updateScore = (index, value) => {
    setScores({ ...scores, [index]: value });
  };

  const calculateResults = () => {
    const total = selectedQuestions.length;
    const good = Object.values(scores).filter(s => s === 'good').length;
    const okay = Object.values(scores).filter(s => s === 'okay').length;
    const weak = Object.values(scores).filter(s => s === 'weak').length;
    const percentage = total > 0 ? Math.round((good + okay * 0.5) / total * 100) : 0;
    return { total, good, okay, weak, percentage };
  };

  const getRecommendation = () => {
    const { percentage } = calculateResults();
    if (percentage >= 70) return 'Strong Yes - Hire';
    if (percentage >= 60) return 'Yes - Good candidate';
    if (percentage >= 50) return 'Maybe - Consider';
    return 'No - Not ready';
  };

  const resetInterview = () => {
    setCandidateName('');
    setInterviewDate(new Date().toISOString().split('T')[0]);
    setInterviewerName('');
    setRole('junior');
    setSelectedQuestions([]);
    setScores({});
    setOverallNotes('');
    setDecision('');
    setShowAnswers({});
    setIsDraft(false);
    setDraftId(null);
    localStorage.removeItem('androidInterviewCurrentDraftId');
    // Clear any existing draft
    if (draftId) {
      const drafts = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
      const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
      localStorage.setItem('androidInterviewDrafts', JSON.stringify(updatedDrafts));
    }
  };

  // Check for existing draft on load
  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
    if (drafts.length > 0) {
      setShowResumeDialog(true);
    }
  }, []);

  // Load questions from JSON when localStorage is empty
  useEffect(() => {
    if (Object.keys(jsonQuestions).length === 0) return;
    if (Object.keys(allQuestions).length === 0) {
      // No saved questions, load from current role
      const currentRole = role;
            const roleQuestions = role === 'hrd-junior'
        ? jsonQuestions['hrd-junior'] || {}
        : jsonQuestions[currentRole] || jsonQuestions['junior'] || {};

      const initialQuestions = {};
      const categories = Object.keys(categoryLabels);
      for (const category of categories) {
        initialQuestions[category] = (roleQuestions[category] || []).map(q => ({
          question: q.question,
          shortAnswer: q.short_answer || q.shortAnswer, // Support both formats
          answer: q.answer, // Full detailed answer for modal
          lookFor: q.look_for || q.lookFor
        }));
      }
      setAllQuestions(initialQuestions);
    }
  }, [jsonQuestions, allQuestions, role, categoryLabels]);

  // Auto-save draft every 30 seconds if there's progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (candidateName.trim() || selectedQuestions.length > 0 || Object.keys(scores).length > 0) {
        saveDraft();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [candidateName, selectedQuestions, scores, overallNotes, decision, interviewDate, interviewerName, role]);

  const saveDraft = () => {
    if (!candidateName.trim() && selectedQuestions.length === 0) return;

    const draft = {
      id: draftId || Date.now(),
      candidateName,
      interviewDate,
      interviewerName,
      role,
      selectedQuestions,
      scores,
      overallNotes,
      decision,
      showAnswers,
      savedAt: new Date().toISOString()
    };

    const drafts = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
    const existingIndex = drafts.findIndex(d => d.id === draft.id);

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }

    setDraftId(draft.id);
    localStorage.setItem('androidInterviewCurrentDraftId', draft.id.toString());
    localStorage.setItem('androidInterviewDrafts', JSON.stringify(drafts));
    setIsDraft(true);
  };

  const loadDraft = (draft) => {
    setCandidateName(draft.candidateName || '');
    setInterviewDate(draft.interviewDate || new Date().toISOString().split('T')[0]);
    setInterviewerName(draft.interviewerName || '');
    setRole(draft.role || 'junior');
    setSelectedQuestions(draft.selectedQuestions || []);
    setScores(draft.scores || {});
    setOverallNotes(draft.overallNotes || '');
    setDecision(draft.decision || '');
    setShowAnswers(draft.showAnswers || {});
    setDraftId(draft.id);
    setIsDraft(true);
    setShowResumeDialog(false);
  };

  const deleteDraft = (draftId) => {
    const drafts = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    localStorage.setItem('androidInterviewDrafts', JSON.stringify(updatedDrafts));
  };

  const clearAllDrafts = () => {
    if (window.confirm('Delete all drafts? This cannot be undone.')) {
      localStorage.removeItem('androidInterviewDrafts');
      localStorage.removeItem('androidInterviewCurrentDraftId');
      setShowResumeDialog(false);
    }
  };

  const saveToInterviewHistory = () => {
    if (!candidateName.trim()) {
      alert('Please enter a candidate name before saving.');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please generate questions before saving.');
      return;
    }

    const results = calculateResults();
    const interviewRecord = {
      id: Date.now(),
      candidateName: candidateName.trim(),
      interviewDate,
      interviewerName: interviewerName.trim(),
      role,
      scores: { ...results },
      recommendation: getRecommendation(),
      decision,
      overallNotes,
      savedAt: new Date().toISOString()
    };

    const savedHistory = localStorage.getItem('androidInterviewHistory');
    let history = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        history = [];
      }
    }

    history.unshift(interviewRecord);
    localStorage.setItem('androidInterviewHistory', JSON.stringify(history));

    // Clear the draft when interview is completed
    if (draftId) {
      const drafts = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
      const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
      localStorage.setItem('androidInterviewDrafts', JSON.stringify(updatedDrafts));
    }

    alert(`Interview with ${candidateName} saved to history!`);
    resetInterview();
  };

  const results = calculateResults();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Resume Draft Dialog */}
        {showResumeDialog && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Resume Draft?</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You have unfinished interview drafts. Would you like to resume one?</p>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]').map((draft) => (
                  <div key={draft.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{draft.candidateName || 'Unnamed'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {draft.role ? draft.role.charAt(0).toUpperCase() + draft.role.slice(1) : 'Junior'} • {new Date(draft.savedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadDraft(draft)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => {
                          deleteDraft(draft.id);
                          const remaining = JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]');
                          if (remaining.length === 0) setShowResumeDialog(false);
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearAllDrafts}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowResumeDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Start New Interview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 pb-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Android Interview Scorecard</h2>
            {isDraft && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-neutral-800 text-orange-800 dark:text-gray-300 rounded-full text-xs">
                <div className="w-2 h-2 bg-orange-500 dark:bg-gray-400 rounded-full"></div>
                Draft Auto-saved
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Interviewer</label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
              <div className="w-full px-2.5 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-700 dark:text-gray-300 text-sm flex items-center">
                <Briefcase size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {selectedQuestions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-neutral-700 rounded">
            <button onClick={getRandomQuestions} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-6 py-2.5 text-sm">
              <Shuffle size={18} /> Generate Questions
            </button>
          </div>
        ) : (
          <>
            {/* Scoring Guide */}
            <div className="bg-blue-50 dark:bg-neutral-800 border-l-2 border-blue-500 dark:border-neutral-600 rounded-r px-3 py-2 mb-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="font-semibold text-green-700">Good:</span> <span className="text-gray-600 dark:text-gray-400">Clear understanding</span></div>
                <div><span className="font-semibold text-yellow-700">Okay:</span> <span className="text-gray-600 dark:text-gray-400">Partial knowledge</span></div>
                <div><span className="font-semibold text-red-700">Weak:</span> <span className="text-gray-600 dark:text-gray-400">Does not know</span></div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-2 mb-6">
              {selectedQuestions.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-neutral-800 rounded p-3 hover:border-blue-300 dark:hover:border-blue-600">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase">{categoryLabels[item.category] || item.category}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Q{index + 1}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.question}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => updateScore(index, 'good')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'good' ? 'bg-green-600 text-white' : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-neutral-700'}`}>Good</button>
                    <button onClick={() => updateScore(index, 'okay')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'okay' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-neutral-700'}`}>Okay</button>
                    <button onClick={() => updateScore(index, 'weak')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'weak' ? 'bg-red-600 text-white' : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-neutral-700'}`}>Weak</button>
                  </div>

                  {(item.shortAnswer || item.lookFor) && (
                    <div className="mt-2">
                      <button 
                        onClick={() => toggleAnswer(index)} 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        {showAnswers[index] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {showAnswers[index] ? 'Hide Quick Reference' : 'Show Quick Reference'}
                      </button>
                      {showAnswers[index] && (
                        <div className="mt-1.5">
                          {/* Short Answer Card - Always clickable to open modal */}
                          <div 
                            onClick={() => setAnswerModalData({ 
                              question: item.question, 
                              answer: item.answer || item.shortAnswer 
                            })}
                            className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-neutral-800 border border-blue-200 dark:border-neutral-700 rounded p-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            {item.shortAnswer && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-wide flex items-center gap-1">
                                    Quick Answer
                                    <span className="text-[9px] text-purple-600 dark:text-purple-400 normal-case">(click for details)</span>
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAnswerModalData({ 
                                        question: item.question, 
                                        answer: item.answer || item.shortAnswer 
                                      });
                                    }}
                                    className="p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                                    title="View detailed explanation"
                                  >
                                    <Info size={12} className="text-purple-600 dark:text-purple-400" />
                                  </button>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">{item.shortAnswer}</span>
                              </div>
                            )}
                            {item.lookFor && (
                              <div className={item.shortAnswer ? "mt-2 pt-2 border-t border-blue-200 dark:border-neutral-700" : ""}>
                                <span className="font-semibold text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-wide block mb-1">Look For:</span>
                                <span className="text-gray-700 dark:text-gray-300">{item.lookFor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="border border-gray-200 rounded p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Results</h3>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-green-600">{results.good}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Good</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-yellow-600">{results.okay}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Okay</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-red-600">{results.weak}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Weak</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-blue-600">{results.percentage}%</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Score</div>
                </div>
              </div>

              <div className="border-2 border-blue-500 dark:border-neutral-600 rounded p-2 text-center bg-blue-50 dark:bg-neutral-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Recommendation</div>
                <div className="text-base font-bold text-gray-900">{getRecommendation()}</div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Overall Notes</label>
              <textarea
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm resize-none"
                rows="3"
                placeholder="Strengths, weaknesses, observations..."
              />
            </div>

            {/* Final Decision */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Final Decision</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">-- Select --</option>
                <option value="strong-yes">Strong Yes - Hire</option>
                <option value="yes">Yes - Good candidate</option>
                <option value="maybe">Maybe - Consider</option>
                <option value="no">No - Not ready</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveToInterviewHistory}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <Save size={16} /> Complete
              </button>
              <button
                onClick={() => {
                  saveDraft();
                  alert('Draft saved! You can resume this interview later.');
                }}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <Download size={16} /> Print
              </button>
              <button
                onClick={resetInterview}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </>
        )}
      </div>

      {/* Answer Detail Modal */}
      <AnswerModal
        isOpen={answerModalData !== null}
        onClose={() => setAnswerModalData(null)}
        question={answerModalData?.question || ''}
        answer={answerModalData?.answer || ''}
        title="Detailed Answer"
      />
    </div>
  );
};

export default Interview;