import React, { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import hljs from 'highlight.js/lib/common';
import { sanitizeRichHtml, richTextAnswerSx } from '../utils/richText';
import { registerHighlighterAliases } from '../utils/richCodeBlock';

registerHighlighterAliases(hljs);

const richTextViewSx = {
  ...richTextAnswerSx,
  bgcolor: 'transparent',
  '& :not(pre) > code': {
    ...richTextAnswerSx['& :not(pre) > code'],
    bgcolor: 'transparent',
  },
};

/**
 * Renders sanitized HTML then applies highlight.js (Atom One Dark via index.js)
 * so stored `<pre><code class="language-...">` keeps the editor's code colors.
 */
export default function RichAnswerHtml({ html }) {
  const rootRef = useRef(null);
  const safe = useMemo(() => sanitizeRichHtml(html), [html]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll('pre code').forEach((codeNode) => {
      if (codeNode.dataset.highlighted) return;
      codeNode.classList.add('hljs');
      if (codeNode.children.length > 0) return;
      hljs.highlightElement(codeNode);
    });
  }, [safe]);

  return (
    <Box
      ref={rootRef}
      className="rich-text-view"
      sx={richTextViewSx}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
