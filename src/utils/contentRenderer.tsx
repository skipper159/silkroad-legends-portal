// Utility function to render content with basic Markdown and HTML support
export const renderContent = (content: string): string => {
  if (!content) return '';

  // Convert Markdown images to HTML: ![alt](url) -> <img src="url" alt="alt" />
  let processedContent = content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 border border-gray-600" />'
  );

  // Convert line breaks to <br> tags
  processedContent = processedContent.replace(/\n/g, '<br>');

  // Convert **bold** to <strong>
  processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert [link](url) to <a>
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-silkroad-gold hover:text-silkroad-blue underline">$1</a>'
  );

  return processedContent;
};

// For React components - returns JSX
export const ContentRenderer = ({ content }: { content: string }) => {
  const renderedContent = renderContent(content);

  return <div className='prose prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};

export default ContentRenderer;
