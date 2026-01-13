import React, { useState, useEffect } from 'react';
import { Download, Trash2, Filter, Search, LayoutGrid, List } from 'lucide-react';

const InterviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterRecommendation, setFilterRecommendation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    loadHistory();
    
    // Add print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          margin: 0.75in;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        /* Hide browser elements during print */
        .print-hide {
          display: none !important;
        }
        
        /* Clean up layout for print */
        .min-h-screen {
          min-height: auto !important;
        }
        
        /* Make sure table fits on page */
        table {
          font-size: 12px !important;
        }
        
        th, td {
          padding: 6px 8px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
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

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this interview record?')) {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('androidInterviewHistory', JSON.stringify(updatedHistory));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear ALL interview history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('androidInterviewHistory');
    }
  };

  const getColorForPrint = (recommendation) => {
  if (recommendation.includes('Strong Yes')) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
  if (recommendation.includes('Yes')) return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' };
  if (recommendation.includes('Maybe')) return { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fde047' };
  return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
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

  const formatSavedAt = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-neutral-800 dark:border-neutral-800 pb-4 mb-6 print-hide">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-neutral-700 rounded hover:bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
                title={viewMode === 'cards' ? 'Switch to Table View' : 'Switch to Card View'}
              >
                {viewMode === 'cards' ? <List size={16} /> : <LayoutGrid size={16} />}
                {viewMode === 'cards' ? 'Table' : 'Cards'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 print-hide">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Search size={14} />
                Search candidates or interviewers
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Filter size={14} />
                Filter by recommendation
              </label>
              <select
                value={filterRecommendation}
                onChange={(e) => setFilterRecommendation(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-neutral-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Candidates</option>
                <option value="hire">Hire (Yes/Strong Yes)</option>
                <option value="consider">Consider (Maybe)</option>
                <option value="not-ready">Not Ready (No)</option>
              </select>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded text-sm"
              >
                <Trash2 size={16} /> Clear All History
              </button>
            </div>
          )}
        </div>

        {/* History Display */}
        <div className="print-only">
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Interview Results</h1>
        </div>

        {/* Printable Table */}
        <div className="print-only border border-gray-200 dark:border-neutral-800 rounded overflow-hidden" style={{ marginBottom: '20px' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Candidate</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '600', color: '#374151', width: '50px' }}>Good</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '600', color: '#374151', width: '50px' }}>Okay</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '600', color: '#374151', width: '50px' }}>Weak</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '600', color: '#374151', width: '50px' }}>%</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Recommendation</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Decision</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '500', color: '#111827' }}>{item.candidateName}</td>
                  <td style={{ padding: '8px 12px', color: '#4b5563' }}>{formatDate(item.interviewDate)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#059669', fontWeight: '600' }}>{item.scores.good}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#d97706', fontWeight: '600' }}>{item.scores.okay}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#dc2626', fontWeight: '600' }}>{item.scores.weak}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>{item.scores.percentage}%</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500', border: '1px solid', ...getColorForPrint(item.recommendation) }}>
                      {item.recommendation}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#4b5563' }}>{getDecisionText(item.decision)}</td>
                  <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: '10px' }}>{item.overallNotes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="border border-gray-200 dark:border-neutral-800 rounded p-8 text-center">
            {history.length === 0 ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No interview history yet</p>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No matching interviews found</p>
            )}
          </div>
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'cards' && (
              <div className="space-y-2">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-neutral-800 rounded p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.candidateName}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getRecommendationColor(item.recommendation)}`}>
                            {item.recommendation}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Interview Date</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(item.interviewDate)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Interviewer</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.interviewerName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Final Decision</span>
                            <span className="font-medium text-gray-900 dark:text-white">{getDecisionText(item.decision)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Saved</span>
                            <span className="font-medium text-gray-900 dark:text-white no-print">{formatSavedAt(item.savedAt)}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-green-50 dark:bg-neutral-800 border border-green-200 dark:border-neutral-700 rounded p-2 text-center">
                            <div className="text-xl font-bold text-green-600">{item.scores.good}</div>
                            <div className="text-[10px] text-gray-600 dark:text-gray-400">Good</div>
                          </div>
                          <div className="bg-yellow-50 dark:bg-neutral-800 border border-yellow-200 dark:border-neutral-700 rounded p-2 text-center">
                            <div className="text-xl font-bold text-yellow-600">{item.scores.okay}</div>
                            <div className="text-[10px] text-gray-600 dark:text-gray-400">Okay</div>
                          </div>
                          <div className="bg-red-50 dark:bg-neutral-800 border border-red-200 dark:border-neutral-700 rounded p-2 text-center">
                            <div className="text-xl font-bold text-red-600">{item.scores.weak}</div>
                            <div className="text-[10px] text-gray-600 dark:text-gray-400">Weak</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-neutral-800 border border-blue-200 dark:border-neutral-700 rounded p-2 text-center">
                            <div className="text-xl font-bold text-blue-600">{item.scores.percentage}%</div>
                            <div className="text-[10px] text-gray-600 dark:text-gray-400">Score</div>
                          </div>
                        </div>

                        {item.overallNotes && (
                            <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-800 rounded p-2">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Notes:</span>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.overallNotes}</p>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col gap-2 no-print">
                        <button
                          onClick={() => deleteEntry(item.id)}
                          className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="border border-gray-200 dark:border-neutral-800 rounded overflow-hidden no-print">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-800">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Candidate</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Interviewer</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-16">Good</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-16">Okay</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-16">Weak</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-16">%</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Recommendation</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Decision</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-1/4">Notes</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-20 no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:bg-neutral-800">
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{item.candidateName}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{formatDate(item.interviewDate)}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.interviewerName || 'N/A'}</td>
                        <td className="px-3 py-2 text-center text-green-600 font-semibold">{item.scores.good}</td>
                        <td className="px-3 py-2 text-center text-yellow-600 font-semibold">{item.scores.okay}</td>
                        <td className="px-3 py-2 text-center text-red-600 font-semibold">{item.scores.weak}</td>
                        <td className="px-3 py-2 text-center text-blue-600 font-semibold">{item.scores.percentage}%</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRecommendationColor(item.recommendation)}`}>
                            {item.recommendation}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{getDecisionText(item.decision)}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-[10px] max-w-xs" title={item.overallNotes || ''}>
                          {item.overallNotes || '-'}
                        </td>
                        <td className="px-3 py-2 text-center no-print">
                          <button onClick={() => deleteEntry(item.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {filteredHistory.length > 0 && (
          <div className="mt-4 flex justify-center print-hide">
            <button
              onClick={() => {
                if (viewMode === 'cards') {
                  setViewMode('table');
                  setTimeout(() => window.print(), 100);
                } else {
                  window.print();
                }
              }}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded text-sm"
              title={viewMode === 'cards' ? 'Auto-switch to Table View for better printing' : 'Print current view'}
            >
              <Download size={18} />
              {viewMode === 'cards' ? 'Print Table View' : 'Print / Save PDF'}
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Print Styles */}
    <style>{`
      @media print {
        @page { margin: 0.5in; }
        body, html { margin: 0; padding: 0; }
        title { display: none !important; }
        head title { display: none !important; }
        .no-print { display: none !important; }
        button, .no-print { display: none !important; }
        .min-h-screen { min-height: auto !important; background: white !important; }
        .max-w-6xl { max-width: 100% !important; padding: 0 !important; }
        .border-b { display: none !important; }
        .mb-6, .mt-4 { margin: 0 !important; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
      }
      .print-only { display: none !important; }
      @media print {
        .print-only { display: block !important; }
      }
    `}</style>
    </>
  );
};

export default InterviewHistory;