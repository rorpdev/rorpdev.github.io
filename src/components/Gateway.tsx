import { useState, useEffect } from 'react';
import {
  X, Briefcase, Settings, History, BookOpen,
  Sparkles, ChevronRight, ArrowLeft, Moon, Sun
} from 'lucide-react';
import Interview from '@/pages/Interview';
import InterviewManage from '@/pages/InterviewManage';
import InterviewHistory from '@/pages/InterviewHistory';
import InterviewReview from '@/pages/InterviewReview';
import { useTheme } from '@/contexts/ThemeContext';

interface GatewayProps {
  setShowWorkspace?: (show: boolean) => void;
}

type ToolId = 'interview' | 'manage' | 'history' | 'review';
type CategoryId = 'interview';

const Gateway = ({ setShowWorkspace }: GatewayProps = {}) => {
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Add keyboard shortcut to close
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If tool is open, close tool
        if (selectedTool) {
          setSelectedTool(null);
        }
        // If category is open, close category
        else if (selectedCategory) {
          setSelectedCategory(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTool, selectedCategory]);

  const categories = [
    {
      id: 'interview' as CategoryId,
      icon: Briefcase,
      name: 'Interview Tools',
      description: 'Conduct and manage candidate interviews',
      availableTools: 4,
    },
  ];

  const toolsByCategory = {
    interview: [
      { id: 'interview' as ToolId, icon: Briefcase, label: 'Scorecard', description: 'Conduct interviews with scoring' },
      { id: 'manage' as ToolId, icon: Settings, label: 'Manage', description: 'Customize interview templates' },
      { id: 'history' as ToolId, icon: History, label: 'History', description: 'Review past interviews' },
      { id: 'review' as ToolId, icon: BookOpen, label: 'Review', description: 'Prepare for interviews with Q&A' },
    ],
  };

  const currentTools = selectedCategory ? toolsByCategory[selectedCategory] : [];

  // If tool selected, show full page with just the tool + close button
  if (selectedTool) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setSelectedTool(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Back to category"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="pt-0">
          {selectedTool === 'interview' && <Interview />}
          {selectedTool === 'manage' && <InterviewManage />}
          {selectedTool === 'history' && <InterviewHistory />}
          {selectedTool === 'review' && <InterviewReview />}
        </div>
      </div>
    );
  }

  // If category selected, show tools within that category
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Workspace</span>
              </button>
              <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
              {category && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-neutral-900 dark:text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{category.name}</h1>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{category.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className="text-left p-6 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-lg transition-all group bg-white dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                      <Icon className="w-6 h-6 text-neutral-900 dark:text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    {tool.label}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{tool.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main Gateway - Show categories
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-neutral-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Personal Workspace</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Your Android development toolkit</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-neutral-900 dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">Welcome! 👋</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Select a category to explore available tools</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const isActive = category.availableTools > 0;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-left p-8 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all group bg-white dark:bg-neutral-900`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                    <CategoryIcon className="w-8 h-8 text-neutral-900 dark:text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                      {category.availableTools} tools
                    </span>
                    <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-all" />
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-1 text-neutral-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{category.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      {setShowWorkspace && (
        <div className="flex justify-end p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setShowWorkspace(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Close workspace"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Close</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gateway;