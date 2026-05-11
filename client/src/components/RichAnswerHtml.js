import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { sanitizeRichHtml, richTextAnswerSx } from '../utils/richText';

const richTextViewSx = {
  ...richTextAnswerSx,
  bgcolor: 'transparent',
  '& pre': {
    ...richTextAnswerSx['& pre'],
    bgcolor: 'transparent',
    border: 'none',
  },
  '& pre code.hljs': {
    ...richTextAnswerSx['& pre code.hljs'],
    backgroundColor: 'transparent',
  },
  '& :not(pre) > code': {
    ...richTextAnswerSx['& :not(pre) > code'],
    bgcolor: 'transparent',
  },
};

const LANGUAGE_ALIAS = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  py: 'python',
};

function getLanguage(preNode, codeNode) {
  const codeAttrs = codeNode?.getAttribute ? codeNode : null;
  const className = codeAttrs?.getAttribute('class') || '';
  const classMatch = className.match(/language-([a-z0-9_+-]+)/i);
  const raw =
    codeNode.getAttribute('data-language') ||
    preNode.getAttribute('data-language') ||
    classMatch?.[1] ||
    'typescript';
  const normalized = String(raw).trim().toLowerCase();
  return LANGUAGE_ALIAS[normalized] || normalized;
}

function splitHtmlAndCodeBlocks(safeHtml) {
  if (!safeHtml || typeof document === 'undefined') {
    return [{ type: 'html', html: safeHtml || '' }];
  }

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="rich-root">${safeHtml}</div>`,
      'text/html'
    );
    const root = doc.getElementById('rich-root');
    if (!root) return [{ type: 'html', html: safeHtml }];

    const codeBlocks = [];
    const markerPrefix = 'RICH_CODE_BLOCK_';

    root.querySelectorAll('pre').forEach((preNode, index) => {
      const codeNode = preNode.querySelector('code');
      if (!codeNode) return;

      const marker = `${markerPrefix}${index}`;
      codeBlocks.push({
        type: 'code',
        marker,
        language: getLanguage(preNode, codeNode),
        source: codeNode.textContent || '',
      });

      preNode.replaceWith(doc.createComment(marker));
    });

    if (codeBlocks.length === 0) {
      return [{ type: 'html', html: root.innerHTML }];
    }

    const splitRegex = new RegExp(`<!--(${markerPrefix}\\d+)-->`, 'g');
    const chunks = root.innerHTML.split(splitRegex);
    const codeMap = new Map(codeBlocks.map((block) => [block.marker, block]));

    return chunks
      .filter(Boolean)
      .map((chunk) => codeMap.get(chunk) || { type: 'html', html: chunk });
  } catch {
    return [{ type: 'html', html: safeHtml }];
  }
}

/**
 * Renders sanitized HTML then applies highlight.js (Atom One Dark via index.css)
 * so stored `<pre><code class="language-…">` matches the editor.
 */
export default function RichAnswerHtml({ html }) {
  const safe = useMemo(() => sanitizeRichHtml(html), [html]);
  const segments = useMemo(() => splitHtmlAndCodeBlocks(safe), [safe]);

  return (
    <Box className="rich-text-view" sx={richTextViewSx}>
      {segments.map((segment, idx) =>
        segment.type === 'code' ? (
          <Box key={`code-${segment.marker}-${idx}`} sx={{ my: 1.5 }}>
            <SyntaxHighlighter
              language={segment.language}
              style={dracula}
              customStyle={{
                background: 'transparent',
                color: '#d4d4d4',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                margin: 0,
                overflowX: 'auto',
                border: 'none',
              }}
            >
              {segment.source}
            </SyntaxHighlighter>
          </Box>
        ) : (
          <Box key={`html-${idx}`} dangerouslySetInnerHTML={{ __html: segment.html }} />
        )
      )}
    </Box>
  );
}
