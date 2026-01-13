import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Shuffle, ChevronDown, ChevronRight, Save, AlertTriangle, Briefcase } from 'lucide-react';

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
  const [jsonQuestions, setJsonQuestions] = useState({});

  const defaultQuestions = {
    compose: [
      { question: 'What is Jetpack Compose?', shortAnswer: 'Modern declarative UI toolkit for Android that uses Kotlin functions to build UI', lookFor: 'Mentions declarative vs imperative approach, no more XML layouts, can give example of @Composable function' },
      { question: 'What is a Composable function?', shortAnswer: 'Function annotated with @Composable that describes UI and can be called from other composables', lookFor: 'Understands it emits UI elements, recomposes when state changes, can be nested' },
      { question: 'What does remember do?', shortAnswer: 'Caches/preserves a value across recompositions so it doesn\'t reset every time', lookFor: 'Understands difference between remember and rememberSaveable, knows when to use it (like storing TextField state)' },
      { question: 'What is mutableStateOf?', shortAnswer: 'Creates observable state that automatically triggers recomposition when value changes', lookFor: 'Can explain what triggers a recomposition, mentions State<T> type, understands read/write with .value' },
      { question: 'What are Modifiers? Give examples.', shortAnswer: 'Chainable decorators that modify composables - padding, size, background, clickable, etc.', lookFor: 'Gives 2-3 real examples, mentions order matters (padding before background vs after), used them in their project' },
      { question: 'Column vs LazyColumn difference?', shortAnswer: 'Column renders all items immediately, LazyColumn only renders visible items (like RecyclerView)', lookFor: 'Understands performance implications, knows when to use each, mentions LazyColumn for long lists' },
      { question: 'Explain State Hoisting', shortAnswer: 'Moving state from child composable to parent to make child stateless and reusable, passing state down and events up', lookFor: 'Can describe a specific example from their project even if they didn\'t call it "state hoisting", understands "single source of truth"' },
      { question: 'What triggers recomposition?', shortAnswer: 'When a State object that a composable reads changes, only that composable recomposes', lookFor: 'Understands it\'s smart/targeted recomposition, not the whole tree, mentions State observation' }
    ],
    android: [
      { question: 'Name main Activity lifecycle methods', shortAnswer: 'onCreate, onStart, onResume, onPause, onStop, onDestroy', lookFor: 'Gets order right, can explain when each is called (onCreate = first time, onResume = visible and interactive)' },
      { question: 'What happens when you rotate screen?', shortAnswer: 'Activity is destroyed and recreated with new configuration', lookFor: 'Mentions data loss risk, knows how to preserve data (ViewModel, onSaveInstanceState), has dealt with this in their project' },
      { question: 'What is an Intent?', shortAnswer: 'Messaging object used to request an action from another component (start Activity, Service, etc.)', lookFor: 'Can explain explicit (specific target) vs implicit (system chooses), gives real example from their project' },
      { question: 'What is in AndroidManifest.xml?', shortAnswer: 'Declares app components (Activities, Services), permissions, required features, app metadata', lookFor: 'Has actually looked at/edited it, knows you must declare Activities there, mentions permissions' },
      { question: 'What are the 4 main app components?', shortAnswer: 'Activity, Service, BroadcastReceiver, ContentProvider', lookFor: 'Can name all 4 and briefly explain purpose of each, has used at least 2-3 in practice' },
      { question: 'What is Context?', shortAnswer: 'Interface to application environment - access to resources, system services, starting activities', lookFor: 'Understands it\'s needed for many operations, knows Application Context vs Activity Context difference' },
      { question: 'What is a Service?', shortAnswer: 'Component that runs in background without UI for long-running operations', lookFor: 'Can give example use case (music player, download), mentions foreground vs background services' },
      { question: 'What is a BroadcastReceiver?', shortAnswer: 'Component that responds to system-wide broadcast announcements (battery low, network change, etc.)', lookFor: 'Gives example of listening to system events, understands it can wake up app' }
    ],
    kotlin: [
      { question: 'val vs var difference?', shortAnswer: 'val is immutable reference (read-only), var is mutable (can be reassigned)', lookFor: 'Clear distinction, knows when to prefer val (default choice), understands val object can still have mutable contents' },
      { question: 'Explain Kotlin null safety', shortAnswer: 'Type system forces you to explicitly mark nullable types with ? - prevents NullPointerException at compile time', lookFor: 'Can explain String vs String?, knows this is a major advantage over Java, has used safe calls' },
      { question: 'What are safe call and Elvis operators?', shortAnswer: '?. safely calls method/property only if not null, ?: provides default value when null', lookFor: 'Shows syntax correctly (obj?.method, val x = y ?: default), has used them in real code' },
      { question: 'What is a data class?', shortAnswer: 'Class primarily for holding data - auto-generates equals, hashCode, toString, copy, destructuring', lookFor: 'Mentions at least 3 generated methods, knows when to use it (DTOs, models), used in their project' },
      { question: 'What are lambda expressions?', shortAnswer: 'Anonymous functions that can be passed as values - { param -> result }', lookFor: 'Shows syntax, gives example with higher-order function (list.filter, map), used with onClick listeners' },
      { question: 'Difference between == and ===?', shortAnswer: '== checks structural equality (values), === checks referential equality (same object in memory)', lookFor: 'Understands == calls equals() method, knows when each is useful' }
    ],
    coroutines: [
      { question: 'What are coroutines?', shortAnswer: 'Lightweight concurrent programming - suspend/resume execution without blocking threads', lookFor: 'Mentions non-blocking, lighter than threads, async/await pattern, has used them for network calls' },
      { question: 'Why use coroutines vs threads?', shortAnswer: 'Much lighter weight (thousands vs hundreds), easier to write/read, structured concurrency, built-in cancellation', lookFor: 'Understands resource efficiency, mentions readability advantage, knows they\'re the modern Android way' },
      { question: 'What is a suspend function?', shortAnswer: 'Function marked with suspend keyword that can pause execution and resume later without blocking', lookFor: 'Knows it can only be called from coroutine or another suspend function, has written suspend functions' },
      { question: 'launch vs async difference?', shortAnswer: 'launch returns Job (fire-and-forget), async returns Deferred that will have a result you can await', lookFor: 'Knows when to use each, mentions await() for async, has used both in their project' },
      { question: 'What are Dispatchers?', shortAnswer: 'Determine which thread pool a coroutine runs on - Main (UI), IO (network/disk), Default (CPU-intensive)', lookFor: 'Names at least 2, knows Main is for UI updates, IO for network/database, used withContext to switch' },
      { question: 'Why not network on Main thread?', shortAnswer: 'Blocks UI thread, freezes app, causes ANR (Application Not Responding) error', lookFor: 'Mentions user experience/responsiveness, knows this is enforced on newer Android, uses Dispatchers.IO' },
      { question: 'What is viewModelScope?', shortAnswer: 'CoroutineScope tied to ViewModel lifecycle - automatically cancels when ViewModel is cleared', lookFor: 'Understands automatic cleanup benefit, used it in their project, knows about lifecycleScope too' }
    ],
    network: [
      { question: 'What is Retrofit?', shortAnswer: 'Type-safe REST API client library - turns HTTP API into Kotlin/Java interface with annotations', lookFor: 'Has actually used it, mentions annotations like @GET @POST, knows about converters (Gson/Moshi)' },
      { question: 'What HTTP methods do you know?', shortAnswer: 'GET (retrieve), POST (create), PUT (update/replace), PATCH (partial update), DELETE (remove)', lookFor: 'Names at least 3-4, can explain when to use each, used them in API calls' },
      { question: 'How do you handle API errors?', shortAnswer: 'Try-catch for network errors, check response.isSuccessful, parse error body, show user-friendly messages', lookFor: 'Mentions specific HTTP codes (404, 500), shows error states in UI, implements retry logic' },
      { question: 'What is JSON?', shortAnswer: 'JavaScript Object Notation - lightweight text format for data exchange using key-value pairs', lookFor: 'Knows it\'s the standard for REST APIs, mentions parsing with Gson/Moshi, has worked with JSON responses' },
      { question: 'What is Room?', shortAnswer: 'SQLite database abstraction layer - provides compile-time query verification and reduces boilerplate', lookFor: 'Mentions Entity, DAO, Database components, has used it for local persistence, knows @Query annotations' },
      { question: 'What is DataStore?', shortAnswer: 'Modern replacement for SharedPreferences - stores key-value pairs or typed objects asynchronously', lookFor: 'Knows it\'s async (uses coroutines), safer than SharedPreferences, mentions Preferences vs Proto DataStore' },
      { question: 'Room vs DataStore - when to use?', shortAnswer: 'Room for complex structured data with relationships/queries, DataStore for simple settings/preferences', lookFor: 'Understands trade-offs, gives concrete examples, knows when each is overkill' }
    ],
    architecture: [
      { question: 'What is ViewModel?', shortAnswer: 'Holds and manages UI-related data that survives configuration changes like rotation', lookFor: 'Mentions lifecycle awareness, separation of concerns, has actually used it, knows it shouldn\'t hold Context reference' },
      { question: 'Why use ViewModel vs Activity?', shortAnswer: 'Survives rotation/config changes, separates UI logic from UI controller, easier to test, lifecycle-aware', lookFor: 'Can explain a concrete benefit from their project, mentions testability, understands separation of concerns' },
      { question: 'What is MVVM?', shortAnswer: 'Model-View-ViewModel - architecture pattern where ViewModel exposes data to View via observable streams', lookFor: 'Can draw/explain the flow, mentions unidirectional data flow, knows Model is data layer, has used it' },
      { question: 'What is Repository pattern?', shortAnswer: 'Mediates between data sources (network/database) and business logic - single source of truth', lookFor: 'Understands it abstracts data layer, handles local vs remote data, used in their project architecture' },
      { question: 'What is Dependency Injection?', shortAnswer: 'Providing objects their dependencies from outside instead of creating them internally', lookFor: 'Explains benefits (testability, loose coupling), can give simple example, knows it makes testing easier' },
      { question: 'What is Hilt?', shortAnswer: 'Dependency injection library built on Dagger - simplified DI for Android with annotations', lookFor: 'Has used it (or Dagger/Koin), mentions @Inject, @HiltAndroidApp, knows it reduces boilerplate' },
      { question: 'Why separate layers?', shortAnswer: 'Maintainability, testability, scalability - changes in one layer don\'t affect others', lookFor: 'Can explain concrete benefit, mentions team collaboration, understands it helps with large apps' }
    ],
    firebase: [
      { question: 'What Firebase services have you used?', shortAnswer: 'Could include: Authentication, Firestore, Realtime DB, Storage, Cloud Functions, Analytics, Crashlytics', lookFor: 'Names specific services they\'ve actually used, can explain what they did with them, shows real project experience' },
      { question: 'What is Firebase Authentication?', shortAnswer: 'Handles user authentication with multiple providers (email, Google, Facebook, phone)', lookFor: 'Has implemented it, mentions token management, knows about FirebaseUser object' },
      { question: 'What is Firestore?', shortAnswer: 'NoSQL cloud database with real-time sync - stores data in collections and documents', lookFor: 'Understands document/collection structure, mentions real-time listeners, has queried/written data' }
    ],
    tools: [
      { question: 'What is Git?', shortAnswer: 'Version control system that tracks code changes and enables team collaboration', lookFor: 'Has actually used it, knows basic commands (commit, push, pull), understands why it\'s important' },
      { question: 'What is a git branch?', shortAnswer: 'Separate line of development that lets you work on features without affecting main code', lookFor: 'Has created and merged branches, mentions feature branches, understands merge conflicts' },
      { question: 'What is Gradle?', shortAnswer: 'Build automation tool for Android - manages dependencies, build variants, compilation', lookFor: 'Knows about build.gradle files, has added dependencies, mentions implementation vs api' },
      { question: 'What debugging tools do you use?', shortAnswer: 'Android Studio debugger, Logcat, breakpoints, Layout Inspector, Network Inspector', lookFor: 'Names specific tools they\'ve actually used, shows practical debugging experience, problem-solving approach' },
      { question: 'What is Logcat?', shortAnswer: 'Console that shows system messages, stack traces, and custom logs from your app', lookFor: 'Has used it to debug, knows Log.d/e/i levels, can filter by tag/package' },
      { question: 'What is ANR?', shortAnswer: 'Application Not Responding - dialog shown when app blocks UI thread for too long (5+ seconds)', lookFor: 'Knows common causes (network on main thread), mentions how to prevent it (background work)' }
    ],
    project: [
      { question: 'Tell me about your RDA project (1-2 min)', shortAnswer: '', lookFor: 'Clear explanation in own words (not memorized), shows enthusiasm, mentions key features, explains the problem it solved' },
      { question: 'What was YOUR specific role?', shortAnswer: '', lookFor: 'Uses "I" not "we", gives specific features/screens they built, honest about what they did vs didn\'t do' },
      { question: 'What was the hardest part?', shortAnswer: '', lookFor: 'Shows problem-solving, learning from challenges, technical depth, persistence through difficulties' },
      { question: 'What technologies did you use?', shortAnswer: '', lookFor: 'Accurate list, actually understands each technology (not just memorized), can explain why they chose them' },
      { question: 'How did check-in/check-out work technically?', shortAnswer: '', lookFor: 'Technical details (API calls, database updates, state management), data flow, error handling' },
      { question: 'How did your team collaborate? Git workflow?', shortAnswer: '', lookFor: 'Branching strategy, code reviews, merge conflicts, communication tools, shows real teamwork' },
      { question: 'What would you do differently?', shortAnswer: '', lookFor: 'Self-awareness, growth mindset, learned from experience, technical improvements they\'d make' },
      { question: 'What feature are you most proud of?', shortAnswer: '', lookFor: 'Shows ownership, explains technical challenges, demonstrates passion, goes into technical detail' }
    ]
  };

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

  // Load questions from JSON
  useEffect(() => {
    fetch('/content/questions.json')
      .then(res => res.json())
      .then(data => {
        const { _metadata, ...questions } = data;
        setJsonQuestions(questions || {});
      })
      .catch(err => console.error('Failed to load questions:', err));
  }, []);

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
      const currentRole = localStorage.getItem('androidInterviewSettings')
        ? JSON.parse(localStorage.getItem('androidInterviewSettings')).selectedTemplate || 'junior'
        : 'junior';
      const roleQuestions = jsonQuestions[currentRole] || jsonQuestions['junior'] || {};

      const initialQuestions = {};
      const categories = Object.keys(categoryLabels);
      for (const category of categories) {
        initialQuestions[category] = (roleQuestions[category] || []).map(q => ({
          question: q.question,
          shortAnswer: q.short_answer,
          lookFor: q.look_for
        }));
      }
      setAllQuestions(initialQuestions);
    }
  }, [jsonQuestions, allQuestions]);

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Resume Draft Dialog */}
        {showResumeDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Resume Draft?</h3>
              </div>
              <p className="text-gray-600 mb-4">You have unfinished interview drafts. Would you like to resume one?</p>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {JSON.parse(localStorage.getItem('androidInterviewDrafts') || '[]').map((draft) => (
                  <div key={draft.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{draft.candidateName || 'Unnamed'}</div>
                      <div className="text-xs text-gray-500">
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
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Android Interview Scorecard</h2>
            {isDraft && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Draft Auto-saved
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interviewer</label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <div className="w-full px-2.5 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-700 text-sm flex items-center">
                <Briefcase size={14} className="mr-2 text-gray-500" />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {selectedQuestions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded">
            <button onClick={getRandomQuestions} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-6 py-2.5 text-sm">
              <Shuffle size={18} /> Generate Questions
            </button>
          </div>
        ) : (
          <>
            {/* Scoring Guide */}
            <div className="bg-blue-50 border-l-2 border-blue-500 rounded-r px-3 py-2 mb-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="font-semibold text-green-700">Good:</span> <span className="text-gray-600">Clear understanding</span></div>
                <div><span className="font-semibold text-yellow-700">Okay:</span> <span className="text-gray-600">Partial knowledge</span></div>
                <div><span className="font-semibold text-red-700">Weak:</span> <span className="text-gray-600">Does not know</span></div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-2 mb-6">
              {selectedQuestions.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 hover:border-blue-300">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">{categoryLabels[item.category] || item.category}</span>
                      <span className="text-xs text-gray-400">Q{index + 1}</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{item.question}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => updateScore(index, 'good')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'good' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50'}`}>Good</button>
                    <button onClick={() => updateScore(index, 'okay')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'okay' ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-yellow-50'}`}>Okay</button>
                    <button onClick={() => updateScore(index, 'weak')} className={`flex-1 min-w-[60px] px-3 py-1 rounded font-medium text-xs ${scores[index] === 'weak' ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50'}`}>Weak</button>
                  </div>

                  {(item.shortAnswer || item.lookFor) && (
                    <div className="mt-2">
                      <button onClick={() => toggleAnswer(index)} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        {showAnswers[index] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {showAnswers[index] ? 'Hide' : 'Show'}
                      </button>
                      {showAnswers[index] && (
                        <div className="mt-1.5 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                          {item.shortAnswer && <div><span className="font-semibold text-gray-700">Short Answer: </span>{item.shortAnswer}</div>}
                          {item.lookFor && <div><span className="font-semibold text-gray-700">Look For: </span>{item.lookFor}</div>}
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
                  <div className="text-[10px] text-gray-500">Good</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-yellow-600">{results.okay}</div>
                  <div className="text-[10px] text-gray-500">Okay</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-red-600">{results.weak}</div>
                  <div className="text-[10px] text-gray-500">Weak</div>
                </div>
                <div className="text-center border border-gray-200 rounded p-2 bg-white">
                  <div className="text-2xl font-bold text-blue-600">{results.percentage}%</div>
                  <div className="text-[10px] text-gray-500">Score</div>
                </div>
              </div>

              <div className="border-2 border-blue-500 rounded p-2 text-center bg-blue-50">
                <div className="text-xs text-gray-600 mb-0.5">Recommendation</div>
                <div className="text-base font-bold text-gray-900">{getRecommendation()}</div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Overall Notes</label>
              <textarea
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
                rows="3"
                placeholder="Strengths, weaknesses, observations..."
              />
            </div>

            {/* Final Decision */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Final Decision</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
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
    </div>
  );
};

export default Interview;