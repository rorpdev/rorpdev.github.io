import React, { useState, useEffect } from 'react';
import { Download, Trash2, Filter, Search } from 'lucide-react';

const InterviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
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

  const deleteEntry = (id) => {
    if (window.confirm('Delete this interview history entry? This cannot be undone.')) {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('androidInterviewHistory', JSON.stringify(updatedHistory));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Delete ALL interview history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('androidInterviewHistory');
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Interview History</h2>
            <div className="flex gap-2">
              <button
                onClick={exportHistory}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded text-sm"
              >
                <Trash2 size={16} /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Candidate or interviewer name..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Recommendation</label>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterRecommendation}
                  onChange={(e) => setFilterRecommendation(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                >
                  <option value="all">All</option>
                  <option value="hire">Hire</option>
                  <option value="consider">Consider</option>
                  <option value="not-ready">Not Ready</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded">
            <p className="text-gray-500">No interview history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.candidateName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(item.recommendation)}`}>
                        {item.recommendation}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-1 font-medium text-gray-900">{formatDate(item.interviewDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Interviewer:</span>
                        <span className="ml-1 font-medium text-gray-900">{item.interviewerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-1 font-medium text-gray-900 capitalize">{item.role || 'Junior'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Score:</span>
                        <span className="ml-1 font-medium text-gray-900">{item.scores.percentage}%</span>
                      </div>
                    </div>

                    {/* Score breakdown */}
                    <div className="flex gap-1 mb-2">
                      <div className="flex-1 text-center bg-green-50 border border-green-200 rounded py-1 px-2">
                        <div className="text-lg font-bold text-green-600">{item.scores.good}</div>
                        <div className="text-[10px] text-green-700">Good</div>
                      </div>
                      <div className="flex-1 text-center bg-yellow-50 border border-yellow-200 rounded py-1 px-2">
                        <div className="text-lg font-bold text-yellow-600">{item.scores.okay}</div>
                        <div className="text-[10px] text-yellow-700">Okay</div>
                      </div>
                      <div className="flex-1 text-center bg-red-50 border border-red-200 rounded py-1 px-2">
                        <div className="text-lg font-bold text-red-600">{item.scores.weak}</div>
                        <div className="text-[10px] text-red-700">Weak</div>
                      </div>
                    </div>

                    {item.overallNotes && (
                      <div className="bg-gray-50 rounded p-2 mb-2">
                        <span className="text-xs font-semibold text-gray-600">Notes:</span>
                        <p className="text-sm text-gray-800 mt-1">{item.overallNotes}</p>
                      </div>
                    )}

                    {item.decision && (
                      <div className="text-sm">
                        <span className="text-gray-500">Final Decision:</span>
                        <span className="ml-1 font-medium text-gray-900">{getDecisionText(item.decision)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteEntry(item.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;