import React from 'react';
import { X } from 'lucide-react';
import MarkdownText from './MarkdownText';

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  title?: string;
}

const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, onClose, question, answer, title = 'Answer Details' }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-lg shadow-xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {question}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownText text={answer} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-neutral-800">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnswerModal;
