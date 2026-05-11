import { mergeAttributes } from '@tiptap/core';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import bash from 'highlight.js/lib/languages/bash';

/** Exclude from picker + lowlight (keep bundle smaller / list focused). */
const EXCLUDED_LANGUAGES = new Set([
  'arduino',
  'diff',
  'ini',
  'less',
  'lua',
  'makefile',
  'php-template',
  'plaintext',
  'python-repl',
]);

const interviewPrepGrammars = Object.fromEntries(
  Object.entries(common).filter(([key]) => !EXCLUDED_LANGUAGES.has(key))
);

/** Shared highlighter for TipTap (subset of hljs common + linux). */
export const lowlight = createLowlight(interviewPrepGrammars);
lowlight.register('linux', bash);

const LABELS = {
  linux: 'Linux',
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  go: 'Go',
  graphql: 'GraphQL',
  java: 'Java',
  javascript: 'JavaScript',
  json: 'JSON',
  kotlin: 'Kotlin',
  markdown: 'Markdown',
  objectivec: 'Objective-C',
  perl: 'Perl',
  php: 'PHP',
  python: 'Python',
  r: 'R',
  ruby: 'Ruby',
  rust: 'Rust',
  scss: 'SCSS',
  shell: 'Shell',
  sql: 'SQL',
  swift: 'Swift',
  typescript: 'TypeScript',
  vbnet: 'VB.NET',
  wasm: 'WebAssembly',
  xml: 'XML',
  yaml: 'YAML',
};

export function formatLanguageLabel(id) {
  if (!id) return 'Auto';
  if (LABELS[id]) return LABELS[id];
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function listSortedCodeLanguages() {
  return [...lowlight.listLanguages()].sort((a, b) => a.localeCompare(b));
}

/** Register viewer-only langs that match TipTap/lowlight (`language-*` classes). */
export function registerHighlighterAliases(hljs) {
  if (hljs && !hljs.getLanguage('linux')) {
    hljs.registerLanguage('linux', bash);
  }
}

/**
 * Syntax-highlighted code blocks (lowlight) + `hljs` root class for themes.
 */
export const richCodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    const lang = node.attrs.language;
    const codeClass = ['hljs', lang ? `language-${lang}` : null].filter(Boolean).join(' ');
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'rich-code-pre',
      }),
      ['code', { class: codeClass }, 0],
    ];
  },
}).configure({
  lowlight,
  defaultLanguage: null,
});
