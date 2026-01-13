import React from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/**
 * Simple markdown renderer for interview answers.
 * Supports:
 * - **bold text**
 * - `inline code`
 * - Line breaks
 * - Numbered lists (1. item, 2. item)
 * - Bullet points (- item, * item)
 */
const MarkdownText: React.FC<MarkdownTextProps> = ({ text, className = '' }) => {
  const renderText = (content: string) => {
    // Split by lines for list handling
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const processInlineFormatting = (line: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentText = line;
      let key = 0;

      // Process bold text: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(currentText)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          const beforeText = currentText.substring(lastIndex, match.index);
          // Process code in this segment
          parts.push(...processCode(beforeText, key++));
        }

        // Add bold text
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold text-gray-900 dark:text-white">
            {match[1]}
          </strong>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < currentText.length) {
        const remainingText = currentText.substring(lastIndex);
        parts.push(...processCode(remainingText, key++));
      }

      return parts.length > 0 ? parts : processCode(currentText, 0);
    };

    const processCode = (text: string, startKey: number): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const codeRegex = /`([^`]+)`/g;
      let lastIndex = 0;
      let match;
      let key = startKey;

      while ((match = codeRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        // Add code
        parts.push(
          <code
            key={`code-${key++}`}
            className="px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 rounded text-xs font-mono"
          >
            {match[1]}
          </code>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : [text];
    };

    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();

      // Check for numbered list (1. item, 2. item)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      // Check for bullet list (- item, * item)
      const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);

      if (numberedMatch || bulletMatch) {
        const content = numberedMatch ? numberedMatch[2] : bulletMatch![1];
        const listMarker = numberedMatch ? `${numberedMatch[1]}.` : '•';

        if (!inList) {
          inList = true;
          listItems = [];
        }

        listItems.push(
          <li key={`list-${idx}`} className="flex gap-2 mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">
              {listMarker}
            </span>
            <span className="flex-1">{processInlineFormatting(content)}</span>
          </li>
        );
      } else {
        // If we were in a list, close it
        if (inList) {
          elements.push(
            <ul key={`ul-${idx}`} className="my-2 space-y-1">
              {listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }

        // Regular line
        if (trimmedLine) {
          elements.push(
            <p key={`p-${idx}`} className="mb-2 last:mb-0">
              {processInlineFormatting(trimmedLine)}
            </p>
          );
        }
      }
    });

    // Close any remaining list
    if (inList) {
      elements.push(
        <ul key="ul-final" className="my-2 space-y-1">
          {listItems}
        </ul>
      );
    }

    return elements.length > 0 ? elements : [content];
  };

  return <div className={className}>{renderText(text)}</div>;
};

export default MarkdownText;
