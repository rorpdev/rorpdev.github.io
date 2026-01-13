import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit2, Trash2, X, BookOpen, Sliders, FolderPlus, RotateCcw, Briefcase } from 'lucide-react';

const InterviewManage = () => {
  const [activeTab, setActiveTab] = useState('settings');

  // Questions loaded from JSON
  const [jsonQuestions, setJsonQuestions] = useState({});
  const [templateMetadata, setTemplateMetadata] = useState({});

  const defaultCategories = ['compose', 'android', 'kotlin', 'coroutines', 'network', 'architecture', 'firebase', 'tools', 'project'];
  const defaultCategoryLabels = {
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

  // Custom categories management
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('androidInterviewCustomCategories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Combine default and custom categories
  const categories = [...defaultCategories, ...Object.keys(customCategories)];
  const categoryLabels = { ...defaultCategoryLabels, ...Object.fromEntries(
    Object.entries(customCategories).map(([id, cat]) => [id, cat.name])
  ) };

  const defaultQuestions = {
    compose: [
      { question: 'What is Jetpack Compose?', shortAnswer: 'Modern declarative UI toolkit for Android that uses Kotlin functions to build UI', lookFor: 'Mentions declarative vs imperative approach' },
      { question: 'What is a Composable function?', shortAnswer: 'Function annotated with @Composable that describes UI', lookFor: 'Understands it emits UI elements' },
      { question: 'What does remember do?', shortAnswer: 'Caches/preserves a value across recompositions', lookFor: 'Knows when to use it' },
      { question: 'What is mutableStateOf?', shortAnswer: 'Creates observable state that triggers recomposition', lookFor: 'Can explain what triggers a recomposition' },
      { question: 'What are Modifiers? Give examples.', shortAnswer: 'Chainable decorators - padding, size, background, clickable', lookFor: 'Gives 2-3 real examples' },
      { question: 'Column vs LazyColumn difference?', shortAnswer: 'Column renders all items, LazyColumn only renders visible items', lookFor: 'Understands performance implications' },
      { question: 'Explain State Hoisting', shortAnswer: 'Moving state from child to parent to make child stateless', lookFor: 'Understands "single source of truth"' },
      { question: 'What triggers recomposition?', shortAnswer: 'When a State object that a composable reads changes', lookFor: 'Understands it\'s smart/targeted recomposition' }
    ],
    android: [
      { question: 'Name main Activity lifecycle methods', shortAnswer: 'onCreate, onStart, onResume, onPause, onStop, onDestroy', lookFor: 'Gets order right' },
      { question: 'What happens when you rotate screen?', shortAnswer: 'Activity is destroyed and recreated with new configuration', lookFor: 'Knows how to preserve data' },
      { question: 'What is an Intent?', shortAnswer: 'Messaging object to request action from another component', lookFor: 'Can explain explicit vs implicit' },
      { question: 'What is in AndroidManifest.xml?', shortAnswer: 'Declares components, permissions, features, metadata', lookFor: 'Has actually looked at/edited it' },
      { question: 'What are the 4 main app components?', shortAnswer: 'Activity, Service, BroadcastReceiver, ContentProvider', lookFor: 'Can name all 4 and explain purpose' },
      { question: 'What is Context?', shortAnswer: 'Interface to app environment - resources, services, activities', lookFor: 'Understands Application vs Activity context' },
      { question: 'What is a Service?', shortAnswer: 'Component for background long-running operations', lookFor: 'Can give example use case' },
      { question: 'What is a BroadcastReceiver?', shortAnswer: 'Component that responds to system broadcasts', lookFor: 'Gives example of system events' }
    ],
    kotlin: [
      { question: 'val vs var difference?', shortAnswer: 'val is immutable (read-only), var is mutable', lookFor: 'Knows when to prefer val' },
      { question: 'Explain Kotlin null safety', shortAnswer: 'Type system forces nullable types with ?', lookFor: 'Understands safety benefit over Java' },
      { question: 'What are safe call and Elvis operators?', shortAnswer: '?. for safe calls, ?: for default when null', lookFor: 'Shows correct syntax' },
      { question: 'What is a data class?', shortAnswer: 'Class for data - generates equals, hashCode, toString, copy', lookFor: 'Mentions at least 3 generated methods' },
      { question: 'What are lambda expressions?', shortAnswer: 'Anonymous functions passed as values - { param -> result }', lookFor: 'Gives example with higher-order function' },
      { question: 'Difference between == and ===?', shortAnswer: '== checks structural equality, === checks referential equality', lookFor: 'Understands == calls equals()' }
    ],
    coroutines: [
      { question: 'What are coroutines?', shortAnswer: 'Lightweight concurrent - suspend/resume without blocking threads', lookFor: 'Mentions non-blocking, async/await' },
      { question: 'Why use coroutines vs threads?', shortAnswer: 'Much lighter, easier to write/read, structured concurrency', lookFor: 'Understands resource efficiency' },
      { question: 'What is a suspend function?', shortAnswer: 'Function that can pause/resume without blocking', lookFor: 'Knows it can only be called from coroutine' },
      { question: 'launch vs async difference?', shortAnswer: 'launch returns Job (fire-and-forget), async returns Deferred', lookFor: 'Knows when to use each' },
      { question: 'What are Dispatchers?', shortAnswer: 'Determine thread pool - Main (UI), IO (network), Default (CPU)', lookFor: 'Names at least 2, knows Main is for UI' },
      { question: 'Why not network on Main thread?', shortAnswer: 'Blocks UI, freezes app, causes ANR', lookFor: 'Understands user experience impact' },
      { question: 'What is viewModelScope?', shortAnswer: 'CoroutineScope tied to ViewModel lifecycle', lookFor: 'Understands automatic cleanup' }
    ],
    network: [
      { question: 'What is Retrofit?', shortAnswer: 'Type-safe REST client - HTTP API to interface', lookFor: 'Mentions @GET @POST annotations' },
      { question: 'What HTTP methods do you know?', shortAnswer: 'GET, POST, PUT, PATCH, DELETE', lookFor: 'Names at least 3-4' },
      { question: 'How do you handle API errors?', shortAnswer: 'Try-catch, check response.isSuccessful, parse error body', lookFor: 'Mentions specific HTTP codes' },
      { question: 'What is JSON?', shortAnswer: 'JavaScript Object Notation - key-value data format', lookFor: 'Knows it\'s standard for REST' },
      { question: 'What is Room?', shortAnswer: 'SQLite abstraction layer - compile-time query verification', lookFor: 'Mentions Entity, DAO, Database' },
      { question: 'What is DataStore?', shortAnswer: 'Modern replacement for SharedPreferences', lookFor: 'Knows it\'s async, safer' },
      { question: 'Room vs DataStore - when to use?', shortAnswer: 'Room for complex data, DataStore for settings', lookFor: 'Gives concrete examples' }
    ],
    architecture: [
      { question: 'What is ViewModel?', shortAnswer: 'Holds UI data that survives config changes', lookFor: 'Mentions lifecycle awareness' },
      { question: 'Why use ViewModel vs Activity?', shortAnswer: 'Survives rotation, separates UI logic, testable', lookFor: 'Can explain concrete benefit' },
      { question: 'What is MVVM?', shortAnswer: 'Model-View-ViewModel pattern', lookFor: 'Understands data flow' },
      { question: 'What is Repository pattern?', shortAnswer: 'Mediates between data sources and logic', lookFor: 'Understands it abstracts data layer' },
      { question: 'What is Dependency Injection?', shortAnswer: 'Providing dependencies from outside', lookFor: 'Explains testability benefits' },
      { question: 'What is Hilt?', shortAnswer: 'DI library built on Dagger', lookFor: 'Has used it or Dagger/Koin' },
      { question: 'Why separate layers?', shortAnswer: 'Maintainability, testability, scalability', lookFor: 'Can explain concrete benefit' }
    ],
    firebase: [
      { question: 'What Firebase services have you used?', shortAnswer: 'Auth, Firestore, Storage, Functions, Analytics', lookFor: 'Names specific services used' },
      { question: 'What is Firebase Authentication?', shortAnswer: 'Handles authentication with multiple providers', lookFor: 'Has implemented it' },
      { question: 'What is Firestore?', shortAnswer: 'NoSQL cloud DB with real-time sync', lookFor: 'Understands document/collection' }
    ],
    tools: [
      { question: 'What is Git?', shortAnswer: 'Version control system for tracking code changes', lookFor: 'Knows basic commands' },
      { question: 'What is a git branch?', shortAnswer: 'Separate development line for features', lookFor: 'Has created and merged branches' },
      { question: 'What is Gradle?', shortAnswer: 'Build automation tool for Android', lookFor: 'Knows about build.gradle' },
      { question: 'What debugging tools do you use?', shortAnswer: 'Debugger, Logcat, Layout Inspector, Network Inspector', lookFor: 'Names specific tools used' },
      { question: 'What is Logcat?', shortAnswer: 'Console showing logs and stack traces', lookFor: 'Knows Log.d/e/i levels' },
      { question: 'What is ANR?', shortAnswer: 'Application Not Responding - blocks UI for 5+ seconds', lookFor: 'Knows common causes' }
    ],
    project: [
      { question: 'Tell me about your RDA project (1-2 min)', shortAnswer: '', lookFor: 'Clear explanation, shows enthusiasm' },
      { question: 'What was YOUR specific role?', shortAnswer: '', lookFor: 'Uses "I" not "we"' },
      { question: 'What was the hardest part?', shortAnswer: '', lookFor: 'Shows problem-solving' },
      { question: 'What technologies did you use?', shortAnswer: '', lookFor: 'Accurate list, understands each' },
      { question: 'How did check-in/check-out work technically?', shortAnswer: '', lookFor: 'Technical details, data flow' },
      { question: 'How did your team collaborate? Git workflow?', shortAnswer: '', lookFor: 'Branching strategy, reviews' },
      { question: 'What would you do differently?', shortAnswer: '', lookFor: 'Self-awareness, growth' },
      { question: 'What feature are you most proud of?', shortAnswer: '', lookFor: 'Shows ownership, technical depth' }
    ]
  };

  // Settings Tab
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('androidInterviewSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { maxQuestionsPerCategory: 2, maxTotalQuestions: 18, selectedTemplate: 'junior' };
      }
    }
    return { maxQuestionsPerCategory: 2, maxTotalQuestions: 18, selectedTemplate: 'junior' };
  });

  // Local state for input fields to allow editing
  const [maxQuestionsInput, setMaxQuestionsInput] = useState(settings.maxQuestionsPerCategory.toString());
  const [maxTotalInput, setMaxTotalInput] = useState(settings.maxTotalQuestions.toString());

  // Sync local state when settings change
  useEffect(() => {
    setMaxQuestionsInput(settings.maxQuestionsPerCategory.toString());
    setMaxTotalInput(settings.maxTotalQuestions.toString());
  }, [settings]);

  // Questions Tab
  const [selectedCategory, setSelectedCategory] = useState('compose');
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
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newShortAnswer, setNewShortAnswer] = useState('');
  const [newLookFor, setNewLookFor] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('androidInterviewQuestions', JSON.stringify(allQuestions));
  }, [allQuestions]);

  // Load initial questions from JSON when localStorage is empty
  useEffect(() => {
    if (Object.keys(jsonQuestions).length === 0) return;
    if (Object.keys(allQuestions).length === 0) {
      // No saved questions, load junior template as default
      const defaultRawQuestions = jsonQuestions['junior'] || {};
      const initialQuestions = {};
      for (const category of categories) {
        initialQuestions[category] = (defaultRawQuestions[category] || []).map(q => ({
          question: q.question,
          shortAnswer: q.short_answer,
          lookFor: q.look_for
        }));
      }
      setAllQuestions(initialQuestions);
    }
  }, [jsonQuestions]);

  useEffect(() => {
    loadHistory();
  }, []);

  // Load external questions from JSON
  useEffect(() => {
    fetch('./content/questions.json')
      .then(res => res.json())
      .then(data => {
        const { _metadata, ...questions } = data;
        setTemplateMetadata(_metadata || {});
        setJsonQuestions(questions || {});
      })
      .catch(err => console.error('Failed to load questions:', err));
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('androidInterviewHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation.includes('Strong Yes')) return 'bg-green-100 text-green-800 border-green-300';
    if (recommendation.includes('Yes')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (recommendation.includes('Maybe')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getDecisionText = (decision) => {
    const decisions = {
      'strong-yes': 'Strong Yes - Hire',
      'yes': 'Yes - Good candidate',
      'maybe': 'Maybe - Consider',
      'no': 'No - Not ready'
    };
    return decisions[decision] || decision || 'Not specified';
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.interviewerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRecommendation === 'all' ||
                         (filterRecommendation === 'hire' && (item.recommendation.includes('Yes'))) ||
                         (filterRecommendation === 'consider' && item.recommendation.includes('Maybe')) ||
                         (filterRecommendation === 'not-ready' && item.recommendation.includes('No'));
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const saveSettings = () => {
    localStorage.setItem('androidInterviewSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const deleteQuestion = (category, index) => {
    if (window.confirm('Delete this question?')) {
      const updated = [...allQuestions[category]];
      updated.splice(index, 1);
      setAllQuestions({ ...allQuestions, [category]: updated });
    }
  };

  const startEditQuestion = (category, index, questionObj) => {
    setEditingQuestion({ category, index, question: questionObj });
  };

  const saveEditQuestion = () => {
    if (editingQuestion && editingQuestion.question.question.trim()) {
      const updated = [...allQuestions[editingQuestion.category]];
      updated[editingQuestion.index] = {
        question: editingQuestion.question.question.trim(),
        shortAnswer: editingQuestion.question.shortAnswer || '',
        lookFor: editingQuestion.question.lookFor || ''
      };
      setAllQuestions({ ...allQuestions, [editingQuestion.category]: updated });
      setEditingQuestion(null);
    }
  };

  const addQuestion = (category) => {
    if (newQuestion.trim()) {
      setAllQuestions({
        ...allQuestions,
        [category]: [...allQuestions[category], {
          question: newQuestion.trim(),
          shortAnswer: newShortAnswer.trim(),
          lookFor: newLookFor.trim()
        }]
      });
      setNewQuestion('');
      setNewShortAnswer('');
      setNewLookFor('');
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all questions to junior template defaults? This cannot be undone.')) {
      const defaultRawQuestions = jsonQuestions['junior'] || {};
      const defaultQuestions = {};
      for (const category of categories) {
        defaultQuestions[category] = (defaultRawQuestions[category] || []).map(q => ({
          question: q.question,
          shortAnswer: q.short_answer,
          lookFor: q.look_for
        }));
      }
      setAllQuestions(defaultQuestions);
      alert('Questions reset to junior template defaults!');
    }
  };

  const deleteAllQuestions = () => {
    if (window.confirm(`Delete ALL questions in "${categoryLabels[selectedCategory]}" category? This cannot be undone.`)) {
      setAllQuestions({
        ...allQuestions,
        [selectedCategory]: []
      });
      alert(`All questions in "${categoryLabels[selectedCategory]}" deleted!`);
    }
  };

  const applyTemplate = (templateId) => {
    // Get metadata and questions from JSON
    const metadata = templateMetadata[templateId];
    if (!metadata) {
      alert('Template not found in questions.json');
      return;
    }

    const templateSettings = {
      ...metadata.settings,
      selectedTemplate: templateId
    };

    // Convert JSON questions to app format
    const rawQuestions = jsonQuestions[templateId] || {};
    const templateQuestions = {};
    for (const category of categories) {
      templateQuestions[category] = (rawQuestions[category] || []).map(q => ({
        question: q.question,
        shortAnswer: q.short_answer,
        lookFor: q.look_for
      }));
    }

    if (window.confirm(`Apply ${metadata.name} template? This will replace current settings and questions.`)) {
      setSettings(templateSettings);
      setAllQuestions(templateQuestions);
      localStorage.setItem('androidInterviewSettings', JSON.stringify(templateSettings));
    }
  };

  // Custom category management
  useEffect(() => {
    localStorage.setItem('androidInterviewCustomCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const categoryId = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (categories.includes(categoryId)) {
      alert('Category already exists!');
      return;
    }

    const newCategory = {
      name: newCategoryName.trim(),
      createdAt: new Date().toISOString()
    };

    setCustomCategories({
      ...customCategories,
      [categoryId]: newCategory
    });

    // Initialize empty questions array for new category
    setAllQuestions({
      ...allQuestions,
      [categoryId]: []
    });

    setNewCategoryName('');
    alert('Custom category added!');
  };

  const startEditCategory = (categoryId) => {
    if (defaultCategories.includes(categoryId)) {
      alert('Cannot edit default categories');
      return;
    }
    setEditingCategoryId(categoryId);
    setEditingCategoryName(customCategories[categoryId].name);
  };

  const saveEditCategory = () => {
    if (!editingCategoryName.trim()) return;

    setCustomCategories({
      ...customCategories,
      [editingCategoryId]: {
        ...customCategories[editingCategoryId],
        name: editingCategoryName.trim()
      }
    });

    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const deleteCustomCategory = (categoryId) => {
    if (defaultCategories.includes(categoryId)) {
      alert('Cannot delete default categories');
      return;
    }

    if (window.confirm(`Delete "${customCategories[categoryId].name}" category and all its questions?`)) {
      const newCustomCategories = { ...customCategories };
      delete newCustomCategories[categoryId];
      setCustomCategories(newCustomCategories);

      const newAllQuestions = { ...allQuestions };
      delete newAllQuestions[categoryId];
      setAllQuestions(newAllQuestions);

      if (selectedCategory === categoryId) {
        setSelectedCategory('compose');
      }
    }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded text-sm ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-gray-300 dark:border-neutral-700'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 dark:border-neutral-800 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white">Manage Interview</h2>

          {/* Tabs */}
          <div className="flex gap-1.5 mt-4 flex-wrap">
            <TabButton id="settings" icon={Sliders} label="Settings" />
            <TabButton id="questions" icon={BookOpen} label="Questions" />
            <TabButton id="categories" icon={FolderPlus} label="Categories" />
          </div>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Interview Templates */}
            <div className="border border-gray-200 dark:border-neutral-800 rounded p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                Interview Templates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {Object.entries(templateMetadata).map(([id, meta]) => (
                  <button
                    key={id}
                    onClick={() => applyTemplate(id)}
                    className={`p-3 border text-left transition-all group ${
                      settings.selectedTemplate === id
                        ? 'border-blue-500 bg-blue-50 dark:bg-neutral-800'
                        : 'border-gray-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-neutral-700'
                    } rounded-lg`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">{meta.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{meta.description}</div>
                    <div className={`text-xs font-medium ${settings.selectedTemplate === id ? 'text-blue-700' : 'text-blue-600 group-hover:text-blue-700'}`}>Load Template →</div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-neutral-800 border border-blue-200 dark:border-neutral-700 rounded p-3 text-xs">
                <p className="text-blue-800 mb-1"><strong>Templates include:</strong></p>
                <p className="text-blue-700">• Appropriate question difficulty for role level</p>
                <p className="text-blue-700">• Pre-configured question counts</p>
                <p className="text-blue-700">• Role-specific categories (Junior focuses on basics, Senior adds architecture)</p>
              </div>
            </div>

            {/* Question Generation Settings */}
            <div className="border border-gray-200 dark:border-neutral-800 rounded p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sliders size={18} className="text-green-600" />
                Question Generation
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Questions per Category
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={maxQuestionsInput}
                  onChange={(e) => setMaxQuestionsInput(e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(parseInt(value))) {
                      setMaxQuestionsInput(settings.maxQuestionsPerCategory.toString());
                    } else {
                      const num = Math.min(10, Math.max(1, parseInt(value)));
                      setMaxQuestionsInput(num.toString());
                      setSettings({ ...settings, maxQuestionsPerCategory: num });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Questions randomly selected from each category.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Questions Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={maxTotalInput}
                  onChange={(e) => setMaxTotalInput(e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(parseInt(value))) {
                      setMaxTotalInput(settings.maxTotalQuestions.toString());
                    } else {
                      const num = Math.min(50, Math.max(1, parseInt(value)));
                      setMaxTotalInput(num.toString());
                      setSettings({ ...settings, maxTotalQuestions: num });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum total questions (capped regardless of categories).
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-neutral-800 border border-yellow-200 dark:border-neutral-700 rounded p-3 mb-4">
                <p className="text-xs font-medium text-yellow-900 mb-0.5">Expected Questions</p>
                <p className="text-xs text-yellow-800">
                  <strong>{Math.min(categories.length * settings.maxQuestionsPerCategory, settings.maxTotalQuestions)}</strong> questions 
                  ({categories.length} categories × {settings.maxQuestionsPerCategory} = {categories.length * settings.maxQuestionsPerCategory}, capped at {settings.maxTotalQuestions})
                </p>
              </div>

              <button
                onClick={saveSettings}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm"
              >
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="border border-gray-200 dark:border-neutral-800 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              Manage Questions
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select Category</label>
              <div className="flex gap-1.5 flex-wrap border-b pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 font-medium transition-colors rounded text-xs ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-gray-300 dark:border-neutral-700'
                    }`}
                  >
                    {categoryLabels[cat]} ({allQuestions[cat]?.length || 0})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {allQuestions[selectedCategory]?.map((q, index) => (
                <div key={index} className="border border-gray-200 dark:border-neutral-800 rounded p-3 bg-white dark:bg-neutral-900">
                  {editingQuestion?.category === selectedCategory && editingQuestion?.index === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingQuestion.question.question}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, question: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                        placeholder="Question"
                      />
                      <input
                        type="text"
                        value={editingQuestion.question.shortAnswer}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, shortAnswer: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Short Answer (optional)"
                      />
                      <input
                        type="text"
                        value={editingQuestion.question.lookFor}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, lookFor: e.target.value }
                        })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Look For (optional)"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveEditQuestion} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                          <Save size={14} /> Save
                        </button>
                        <button onClick={() => setEditingQuestion(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-neutral-8000 hover:bg-gray-600 text-white rounded text-sm">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <p className="flex-1 font-medium text-gray-900 dark:text-white text-sm">{q.question}</p>
                        <div className="flex gap-1">
                          <button onClick={() => startEditQuestion(selectedCategory, index, q)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-700 rounded transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteQuestion(selectedCategory, index)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded p-3 bg-white dark:bg-neutral-900 mb-3">
              <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Add New Question</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Question"
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={newShortAnswer}
                  onChange={(e) => setNewShortAnswer(e.target.value)}
                  placeholder="Short Answer (optional)"
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <input
                  type="text"
                  value={newLookFor}
                  onChange={(e) => setNewLookFor(e.target.value)}
                  placeholder="Look For (optional)"
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <button onClick={() => addQuestion(selectedCategory)} className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-medium text-sm">
                  <Plus size={16} /> Add Question
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={deleteAllQuestions}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded text-sm"
              >
                <Trash2 size={16} /> Delete All in "{categoryLabels[selectedCategory]}"
              </button>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1.5 rounded text-sm"
              >
                <RotateCcw size={16} /> Reset All to Defaults
              </button>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="border border-gray-200 dark:border-neutral-800 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderPlus size={18} className="text-blue-600" />
              Manage Categories
            </h3>

            {/* Add New Category */}
            <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded p-3 bg-white dark:bg-neutral-900 mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Add Custom Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name (e.g., 'React Native', 'Security')"
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                />
                <button onClick={addCustomCategory} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Categories</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {defaultCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-2 border border-gray-200 dark:border-neutral-800 rounded bg-gray-50 dark:bg-neutral-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{defaultCategoryLabels[cat]}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({allQuestions[cat]?.length || 0} questions)</span>
                  </div>
                ))}
              </div>

              {Object.keys(customCategories).length > 0 && (
                <>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom Categories</h4>
                  <div className="space-y-2">
                    {Object.entries(customCategories).map(([categoryId, category]) => (
                      <div key={categoryId} className="flex items-center justify-between p-2 border border-blue-200 rounded bg-blue-50">
                        {editingCategoryId === categoryId ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
                            />
                            <button onClick={saveEditCategory} className="p-1 text-green-600 hover:bg-green-100 rounded">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingCategoryId(null)} className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-700">{category.name}</span>
                              <span className="text-xs text-blue-600">({allQuestions[categoryId]?.length || 0} questions)</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => startEditCategory(categoryId)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => deleteCustomCategory(categoryId)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewManage;