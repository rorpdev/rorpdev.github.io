import { useState, useEffect } from 'react';
import { X, Briefcase, Settings, History } from 'lucide-react';
import Interview from '@/pages/Interview';
import InterviewManage from '@/pages/InterviewManage';
import InterviewHistory from '@/pages/InterviewHistory';

interface GatewayProps {
  setShowWorkspace?: (show: boolean) => void;
}

const Gateway = ({ setShowWorkspace }: GatewayProps = {}) => {
  const [selectedTool, setSelectedTool] = useState<'interview' | 'manage' | 'history' | null>(null);

  // Add keyboard shortcut to close tool (not workspace)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTool(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const tools = [
    { id: 'interview' as const, icon: Briefcase, label: 'Scorecard' },
    { id: 'manage' as const, icon: Settings, label: 'Manage' },
    { id: 'history' as const, icon: History, label: 'History' },
  ];

  // If no tool selected, show tool selection
  if (!selectedTool) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Interview Tools</h1>
          <p className="text-muted-foreground mb-8">Select a tool to begin</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className="flex-1 flex flex-col items-center gap-3 p-8 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <Icon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-semibold text-lg">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {setShowWorkspace && (
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowWorkspace(false)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Tool selected - show full page with just the tool + close button
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setSelectedTool(null)}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-0">
        {selectedTool === 'interview' && <Interview />}
        {selectedTool === 'manage' && <InterviewManage />}
        {selectedTool === 'history' && <InterviewHistory />}
      </div>
    </div>
  );
};

export default Gateway;