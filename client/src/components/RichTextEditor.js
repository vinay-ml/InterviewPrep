import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color, FontFamily } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import { richTextAnswerSx, normalizeRichHtml } from '../utils/richText';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Menu,
  MenuItem,
  ListSubheader,
} from '@mui/material';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatUnderlined from '@mui/icons-material/FormatUnderlined';
import StrikethroughS from '@mui/icons-material/StrikethroughS';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import FormatQuote from '@mui/icons-material/FormatQuote';
import HorizontalRule from '@mui/icons-material/HorizontalRule';
import LooksOne from '@mui/icons-material/LooksOne';
import LooksTwo from '@mui/icons-material/LooksTwo';
import Looks3 from '@mui/icons-material/Looks3';
import Title from '@mui/icons-material/Title';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import TableChart from '@mui/icons-material/TableChart';
import HighlightIcon from '@mui/icons-material/Highlight';
import FormatAlignLeft from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenter from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRight from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustify from '@mui/icons-material/FormatAlignJustify';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DeleteForever from '@mui/icons-material/DeleteForever';
import Code from '@mui/icons-material/Code';
import {
  richCodeBlock,
  listSortedCodeLanguages,
  formatLanguageLabel,
} from '../utils/richCodeBlock';

function CodeLanguagePicker({ editor, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const langs = useMemo(() => listSortedCodeLanguages(), []);
  const open = Boolean(anchorEl);
  const inCode = editor?.isActive('codeBlock');
  const currentLang = editor?.getAttributes('codeBlock')?.language;

  const handlePick = (lang) => {
    if (!editor) return;
    if (editor.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language: lang }).run();
    } else {
      editor.chain().focus().toggleCodeBlock({ language: lang }).run();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Code block — pick language (VS Code colors)">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            color={inCode ? 'primary' : 'default'}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Code fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: { maxHeight: 380, width: 280 },
          },
        }}
      >
        <ListSubheader sx={{ lineHeight: 1.5 }}>Language</ListSubheader>
        {langs.map((id) => (
          <MenuItem
            key={id}
            selected={Boolean(inCode && currentLang === id)}
            dense
            onClick={() => handlePick(id)}
          >
            {formatLanguageLabel(id)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const FONT_PRESETS = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier', value: '"Courier New", Courier, monospace' },
];

const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'];

function MenuBar({ editor, disabled }) {
  const [, refresh] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    if (!editor) return;
    const onChange = () => refresh();
    editor.on('selectionUpdate', onChange);
    editor.on('transaction', onChange);
    return () => {
      editor.off('selectionUpdate', onChange);
      editor.off('transaction', onChange);
    };
  }, [editor]);

  if (!editor) return null;

  const cursorInTable =
    editor.isActive('table') || editor.isActive('tableCell') || editor.isActive('tableHeader');

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL (https:// or data URL)');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const pickHighlight = () => {
    if (editor.isActive('highlight')) {
      editor.chain().focus().unsetHighlight().run();
      return;
    }
    const color =
      window.prompt(
        `Highlight color (hex), or one of: ${HIGHLIGHT_COLORS.join(', ')}`,
        HIGHLIGHT_COLORS[0]
      ) || HIGHLIGHT_COLORS[0];
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const btn = (title, onClick, icon, active = false) => (
    <Tooltip title={title} key={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          color={active ? 'primary' : 'default'}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.25,
        py: 1,
        px: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      {btn('Undo', () => editor.chain().focus().undo().run(), <Undo fontSize="small" />)}
      {btn('Redo', () => editor.chain().focus().redo().run(), <Redo fontSize="small" />)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn(
        'Heading 1',
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        <LooksOne fontSize="small" />,
        editor.isActive('heading', { level: 1 })
      )}
      {btn(
        'Heading 2',
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        <LooksTwo fontSize="small" />,
        editor.isActive('heading', { level: 2 })
      )}
      {btn(
        'Heading 3',
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        <Looks3 fontSize="small" />,
        editor.isActive('heading', { level: 3 })
      )}
      {btn(
        'Paragraph',
        () => editor.chain().focus().setParagraph().run(),
        <Title fontSize="small" />,
        editor.isActive('paragraph')
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn(
        'Bold',
        () => editor.chain().focus().toggleBold().run(),
        <FormatBold fontSize="small" />,
        editor.isActive('bold')
      )}
      {btn(
        'Italic',
        () => editor.chain().focus().toggleItalic().run(),
        <FormatItalic fontSize="small" />,
        editor.isActive('italic')
      )}
      {btn(
        'Underline',
        () => editor.chain().focus().toggleUnderline().run(),
        <FormatUnderlined fontSize="small" />,
        editor.isActive('underline')
      )}
      {btn(
        'Strikethrough',
        () => editor.chain().focus().toggleStrike().run(),
        <StrikethroughS fontSize="small" />,
        editor.isActive('strike')
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Text color">
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
        >
          <input
            type="color"
            disabled={disabled}
            aria-label="Text color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            style={{
              width: 28,
              height: 26,
              border: 'none',
              padding: 0,
              cursor: disabled ? 'default' : 'pointer',
              background: 'transparent',
            }}
          />
        </Box>
      </Tooltip>
      {btn(
        'Highlight',
        pickHighlight,
        <HighlightIcon fontSize="small" />,
        editor.isActive('highlight')
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn(
        'Bullet list',
        () => editor.chain().focus().toggleBulletList().run(),
        <FormatListBulleted fontSize="small" />,
        editor.isActive('bulletList')
      )}
      {btn(
        'Numbered list',
        () => editor.chain().focus().toggleOrderedList().run(),
        <FormatListNumbered fontSize="small" />,
        editor.isActive('orderedList')
      )}
      {btn(
        'Quote',
        () => editor.chain().focus().toggleBlockquote().run(),
        <FormatQuote fontSize="small" />,
        editor.isActive('blockquote')
      )}
      {btn(
        'Horizontal rule',
        () => editor.chain().focus().setHorizontalRule().run(),
        <HorizontalRule fontSize="small" />
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn(
        'Align left',
        () => editor.chain().focus().setTextAlign('left').run(),
        <FormatAlignLeft fontSize="small" />,
        editor.isActive({ textAlign: 'left' })
      )}
      {btn(
        'Align center',
        () => editor.chain().focus().setTextAlign('center').run(),
        <FormatAlignCenter fontSize="small" />,
        editor.isActive({ textAlign: 'center' })
      )}
      {btn(
        'Align right',
        () => editor.chain().focus().setTextAlign('right').run(),
        <FormatAlignRight fontSize="small" />,
        editor.isActive({ textAlign: 'right' })
      )}
      {btn(
        'Justify',
        () => editor.chain().focus().setTextAlign('justify').run(),
        <FormatAlignJustify fontSize="small" />,
        editor.isActive({ textAlign: 'justify' })
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn('Link', setLink, <LinkIcon fontSize="small" />, editor.isActive('link'))}
      {btn('Image', addImage, <ImageIcon fontSize="small" />)}
      {btn(
        'Insert table',
        () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        <TableChart fontSize="small" />,
        cursorInTable
      )}
      {cursorInTable && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              alignSelf: 'center',
              px: 0.5,
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Table
          </Typography>
          {btn(
            'Add row above',
            () => editor.chain().focus().addRowBefore().run(),
            <KeyboardArrowUp fontSize="small" />
          )}
          {btn(
            'Add row below',
            () => editor.chain().focus().addRowAfter().run(),
            <KeyboardArrowDown fontSize="small" />
          )}
          {btn(
            'Delete this row',
            () => editor.chain().focus().deleteRow().run(),
            <DeleteOutline fontSize="small" />
          )}
          {btn(
            'Add column left',
            () => editor.chain().focus().addColumnBefore().run(),
            <KeyboardArrowLeft fontSize="small" />
          )}
          {btn(
            'Add column right',
            () => editor.chain().focus().addColumnAfter().run(),
            <KeyboardArrowRight fontSize="small" />
          )}
          {btn(
            'Delete this column',
            () => editor.chain().focus().deleteColumn().run(),
            <DeleteOutline fontSize="small" />
          )}
          {btn(
            'Delete entire table',
            () => editor.chain().focus().deleteTable().run(),
            <DeleteForever fontSize="small" />
          )}
        </>
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {FONT_PRESETS.map((f) => {
        const active = editor.getAttributes('textStyle').fontFamily === f.value;
        return (
          <React.Fragment key={f.label}>
            {btn(
              `Font ${f.label}`,
              () => editor.chain().focus().setFontFamily(f.value).run(),
              <Box
                component="span"
                sx={{
                  fontFamily: f.value,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  px: 0.5,
                }}
              >
                Ag
              </Box>,
              active
            )}
          </React.Fragment>
        );
      })}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {btn(
        'Reset font',
        () => editor.chain().focus().unsetFontFamily().run(),
        <Box sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Aa</Box>,
        false
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <CodeLanguagePicker editor={editor} disabled={disabled} />
    </Box>
  );
}

export default function RichTextEditor({ value, onChange, disabled, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
            class: 'rich-link',
          },
        },
      }),
      richCodeBlock,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({ renderWrapper: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || 'Type your answer — headings, lists, tables, links, images…',
      }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      transformPastedHTML(html) {
        return normalizeRichHtml(html);
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const next = value ?? '';
    const cur = editor.getHTML();
    if (cur === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '& .ProseMirror': {
          minHeight: 220,
          maxHeight: 480,
          overflowY: 'auto',
          padding: 2,
          outline: 'none',
          ...richTextAnswerSx,
        },
      }}
    >
      <MenuBar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </Box>
  );
}
