import DOMPurify from 'dompurify';

/** Detect stored HTML (TipTap / pasted rich content) vs plain text. */
const HTML_TAG_RE =
  /<\s*(p|div|span|center|section|article|main|mark|u|del|sup|sub|details|summary|h[1-6]|ul|ol|li|table|colgroup|col|caption|tr|td|th|thead|tbody|tfoot|strong|b|em|i|s|br|hr|img|a|blockquote|pre|code|figure|figcaption|input|font)\b/i;

export function looksLikeHtml(str) {
  if (str == null || typeof str !== 'string') return false;
  return HTML_TAG_RE.test(str);
}

/**
 * Normalize `answers` from API: Mongo may store a proper string[], a single
 * element that is still a JSON array string, or legacy `,,` splits that broke
 * JSON (showing `["` / `[\"` as separate "answers").
 */
export function parseAnswersFromApi(answers) {
  const trim = (s) => String(s ?? '').trim();
  const normalizeOne = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return trim(value);
    if (typeof value === 'object') {
      // Defensive fallback for non-schema payloads from API/migrations.
      if (typeof value.html === 'string') return trim(value.html);
      if (typeof value.text === 'string') return trim(value.text);
      try {
        return trim(JSON.stringify(value));
      } catch (_) {
        return '';
      }
    }
    return trim(value);
  };

  if (answers == null || answers === '') return [];

  if (typeof answers === 'string') {
    const s = trim(answers);
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          return parsed.map(trim).filter(Boolean);
        }
      } catch (_) {
        /* legacy */
      }
    }
    return s.includes(',,') ? s.split(',,').map(trim).filter(Boolean) : [s];
  }

  if (!Array.isArray(answers)) return [];

  const flat = answers.map((x) => normalizeOne(x)).filter((x) => x !== '');
  if (flat.length === 0) return [];

  if (flat.length === 1) {
    const sole = flat[0];
    if (sole.startsWith('[')) {
      try {
        const parsed = JSON.parse(sole);
        if (Array.isArray(parsed)) {
          return parsed.map(trim).filter(Boolean);
        }
      } catch (_) {
        /* keep sole */
      }
    }
    return flat;
  }

  const merged = flat.join('');
  if (merged.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(merged.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(trim).filter(Boolean);
      }
    } catch (_) {
      /* use flat segments */
    }
  }

  return flat;
}

/** Visible text after stripping tags (used for “has a real answer?” checks). */
export function visibleTextFromAnswerHtml(htmlLike) {
  return String(htmlLike ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

/** True when `answers` from the API contains at least one non-empty visible segment. */
export function hasMeaningfulAnswersFromApi(answers) {
  return parseAnswersFromApi(answers).some((x) => visibleTextFromAnswerHtml(x).length > 0);
}

/** Rich segments that are still “content” when stripped text is empty (e.g. diagrams, tables). */
const SUBSTANTIVE_HTML_RE = /<(img|table|video|svg|iframe|pre|hr|figure|audio)\b/i;

/** Whether a single answer segment should render in the question card. */
export function answerSegmentIsRenderable(htmlLike) {
  const s = String(htmlLike ?? '').trim();
  if (!s) return false;
  if (visibleTextFromAnswerHtml(s).length > 0) return true;
  if (looksLikeHtml(s) && SUBSTANTIVE_HTML_RE.test(s)) return true;
  return false;
}

/** True when the API payload has at least one segment we can show (text and/or substantive HTML). */
export function hasRenderableAnswersFromApi(answers) {
  return parseAnswersFromApi(answers).some(answerSegmentIsRenderable);
}

export const QUESTION_TYPES = ['coding', 'theory', 'notes'];

/**
 * Older DB documents may omit `questionType`. Treat as coding when the record
 * has sample code and no meaningful answer (typical LeetCode-style entries).
 */
export function coalesceQuestionType(data) {
  const d = data || {};
  const t = d.questionType;
  if (QUESTION_TYPES.includes(t)) return t;
  const hasCode = String(d.sampleCode || '').trim().length > 0;
  const hasMeaningfulAnswer = hasMeaningfulAnswersFromApi(d.answers);
  if (hasCode && !hasMeaningfulAnswer) return 'coding';
  return 'theory';
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * ChatGPT / Word often emit legacy alignment (`<center>`, `align="right"`).
 * Convert to inline text-align so browsers and DOMPurify render consistently.
 */
export function normalizeRichHtml(html) {
  if (!html || typeof html !== 'string') return html;
  if (typeof document === 'undefined') return html;
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="rich-normalize-root">${html}</div>`,
      'text/html'
    );
    const root = doc.getElementById('rich-normalize-root');
    if (!root) return html;

    root.querySelectorAll('center').forEach((node) => {
      const div = doc.createElement('div');
      div.setAttribute('style', 'text-align:center;width:100%;');
      div.innerHTML = node.innerHTML;
      node.replaceWith(div);
    });

    root.querySelectorAll('[align]').forEach((node) => {
      const raw = node.getAttribute('align');
      if (!raw) return;
      const a = String(raw).toLowerCase().trim();
      if (!['left', 'center', 'right', 'justify'].includes(a)) return;
      let style = node.getAttribute('style') || '';
      if (!/text-align\s*:/i.test(style)) {
        style = `${style}${style && !style.trim().endsWith(';') ? ';' : ''}text-align:${a}`;
      }
      node.setAttribute('style', style);
      node.removeAttribute('align');
    });

    /** Pasted / exported code often stores line breaks as literal `\n` instead of real newlines. */
    root.querySelectorAll('pre code').forEach((code) => {
      const t = code.textContent;
      if (!t || !t.includes('\\')) return;
      const literalNl = (t.match(/\\n/g) || []).length;
      const literalCrLf = (t.match(/\\r\\n/g) || []).length;
      const literalTab = (t.match(/\\t/g) || []).length;
      const realNl = (t.match(/\n/g) || []).length;
      if (literalNl + literalCrLf === 0) return;
      if (literalNl + literalCrLf > realNl) {
        code.textContent = t
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\n')
          .replace(/\\t/g, '\t');
      } else if (literalTab > 0 && !t.includes('\t')) {
        code.textContent = t.replace(/\\t/g, '\t');
      }
    });

    /** Remove pasted ChatGPT-style code block chrome: `</>`, language label, Copy button. */
    const isCodeBlockToolbar = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const text = (el.textContent || '').trim();
      if (text.length > 260 || !/copy/i.test(text)) return false;
      const low = text.toLowerCase();
      if (/\bauto\b/.test(low)) return true;
      if (text.includes('</') || text.includes('/>')) return true;
      if (el.querySelector('svg')) return true;
      return false;
    };
    root.querySelectorAll('pre').forEach((pre) => {
      let prev = pre.previousElementSibling;
      while (prev && isCodeBlockToolbar(prev)) {
        const next = prev.previousElementSibling;
        prev.remove();
        prev = next;
      }
      const wrap = pre.parentElement;
      if (
        wrap &&
        wrap !== root &&
        wrap.children.length <= 4 &&
        wrap.firstElementChild &&
        wrap.firstElementChild !== pre &&
        isCodeBlockToolbar(wrap.firstElementChild)
      ) {
        wrap.firstElementChild.remove();
      }
    });

    /** Wide tables scroll horizontally on mobile (same pattern as `pre code`). */
    Array.from(root.querySelectorAll('table')).forEach((table) => {
      if (table.closest('.rich-table-scroll') || table.closest('.tableWrapper')) return;
      const scrollWrap = doc.createElement('div');
      scrollWrap.setAttribute('class', 'rich-table-scroll');
      table.parentNode.insertBefore(scrollWrap, table);
      scrollWrap.appendChild(table);
    });

    return root.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Build a single HTML document for the editor from API shape (`answers` is string[]).
 * Legacy multi-part answers (plain text segments) become stacked paragraphs.
 */
export function answersToEditorHtml(answers) {
  const parts = parseAnswersFromApi(answers);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    const one = String(parts[0]);
    return typeof document !== 'undefined' ? normalizeRichHtml(one) : one;
  }
  const allPlain = parts.every((p) => !looksLikeHtml(String(p)));
  if (allPlain) {
    return parts.map((p) => `<p>${escapeHtml(String(p))}</p>`).join('');
  }
  const merged = parts
    .map((p) => (looksLikeHtml(String(p)) ? String(p) : `<p>${escapeHtml(String(p))}</p>`))
    .join('');
  return typeof document !== 'undefined' ? normalizeRichHtml(merged) : merged;
}

/** Shared MUI `sx` for rendered answers + TipTap `.ProseMirror` (ChatGPT / Word paste). */
export const richTextAnswerSx = {
  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
  lineHeight: 1.65,
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'auto',
  /* `word-break: break-word` on tables forces one character per line in narrow cells */
  wordBreak: 'normal',
  overflowWrap: 'break-word',
  '& h1': {
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: '0.75em 0 0.45em',
  },
  '& h2': {
    fontSize: '1.35rem',
    fontWeight: 700,
    margin: '0.65em 0 0.35em',
  },
  '& h3': {
    fontSize: '1.15rem',
    fontWeight: 600,
    margin: '0.55em 0 0.3em',
  },
  '& p': { margin: '0.45em 0' },
  '& ul, & ol': {
    paddingLeft: '1.5rem',
    margin: '0.55em 0',
  },
  '& li': { margin: '0.25em 0' },
  '& ul ul, & ol ol, & ul ol, & ol ul': {
    marginTop: '0.35em',
    marginBottom: '0.35em',
  },
  '& hr': {
    border: 'none',
    borderTop: '1px solid',
    borderColor: 'divider',
    margin: '1.35rem 0',
  },
  '& pre': {
    margin: '1rem 0',
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'divider',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    bgcolor: 'transparent',
  },
  '& pre code': {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    display: 'block',
    whiteSpace: 'pre',
    overflowX: 'auto',
    fontSize: '0.875rem',
    lineHeight: 1.55,
  },
  '& pre code.hljs': {
    padding: '14px 16px',
  },
  '& :not(pre) > code': {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    bgcolor: 'action.selected',
    px: '6px',
    py: '2px',
    borderRadius: '4px',
    fontSize: '0.88em',
  },
  '& mark': {
    padding: '0 3px',
    borderRadius: '2px',
    bgcolor: 'rgba(255, 235, 59, 0.28)',
    color: 'inherit',
  },
  '& u': {
    textUnderlineOffset: '2px',
  },
  '& .rich-table-scroll, & .tableWrapper': {
    display: 'block',
    width: 'fit-content',
    maxWidth: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    margin: '1em 0',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'action.hover',
  },
  '& .rich-table-scroll table, & .tableWrapper table': {
    borderCollapse: 'collapse',
    width: 'max-content',
    margin: 0,
    tableLayout: 'auto',
  },
  '& table': {
    borderCollapse: 'collapse',
    width: 'max-content',
    margin: '1em 0',
    tableLayout: 'auto',
  },
  '& th, & td': {
    border: '1px solid',
    borderColor: 'divider',
    padding: '8px 14px',
    verticalAlign: 'middle',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    whiteSpace: 'nowrap',
  },
  '& td': {
    textAlign: 'left',
  },
  '& th': {
    fontWeight: 600,
    bgcolor: 'action.hover',
    textAlign: 'center',
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '6px',
    display: 'block',
  },
  '& a': {
    color: '#58a6ff',
    textDecoration: 'underline',
    wordBreak: 'break-all',
    '&:hover': { color: '#79b8ff' },
  },
  '& blockquote': {
    margin: '1rem 0',
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: '1rem',
    borderLeft: '4px solid',
    borderColor: 'primary.main',
    opacity: 0.95,
  },
  '& blockquote p': {
    margin: '0.35em 0',
  },
  '& ul:has(> li > input[type="checkbox"]), & ol:has(> li > input[type="checkbox"])': {
    listStyle: 'none',
    paddingLeft: '4px',
  },
  '& li:has(> input[type="checkbox"])': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    listStyle: 'none',
    paddingLeft: 0,
    marginLeft: 0,
  },
  '& li:has(> input[type="checkbox"])::marker': {
    content: '""',
    display: 'none',
  },
  '& li input[type="checkbox"]': {
    marginTop: '4px',
    flexShrink: 0,
  },
};

export function sanitizeRichHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const normalized = normalizeRichHtml(html);
  return DOMPurify.sanitize(normalized, {
    ADD_TAGS: ['center', 'mark', 'u', 'details', 'summary'],
    ADD_ATTR: [
      'style',
      'class',
      'colspan',
      'rowspan',
      'target',
      'rel',
      'src',
      'href',
      'alt',
      'title',
      'width',
      'height',
      'align',
      'checked',
      'disabled',
      'type',
      'data-color',
      'data-font-family',
      'data-language',
    ],
    ALLOW_DATA_ATTR: true,
  });
}

/** Serialize answers for API: JSON array avoids `,,` collisions inside HTML. */
export function serializeAnswersForApi(html) {
  if (html == null) return JSON.stringify([]);
  const raw = String(html);
  if (!raw.trim()) return JSON.stringify([]);
  const normalized = normalizeRichHtml(raw);
  return JSON.stringify([normalized]);
}
