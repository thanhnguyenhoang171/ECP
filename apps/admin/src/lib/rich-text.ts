import sanitizeHtml from 'sanitize-html';

const escapeText = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const sanitizeRichText = (html: string, allowLocalImages = false): string => sanitizeHtml(html, {
  allowedTags: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'blockquote', 'hr', 'pre', 'code', 'a', 'span', 'div', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col'],
  allowedAttributes: {
    '*': ['style'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    td: ['colspan', 'rowspan', 'colwidth'],
    th: ['colspan', 'rowspan', 'colwidth'],
    ol: ['start'],
  },
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      'text-align': [/^(left|right|center|justify)$/],
      'font-size': [/^(?:[89]|[1-6]\d|7[0-2])(?:px|pt)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: allowLocalImages ? ['http', 'https', 'blob'] : ['http', 'https'] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
});

export const toRichTextHtml = (value?: string, allowLocalImages = false): string => {
  if (!value?.trim()) { return ''; }
  const isHtml = /<\/?(?:p|div|h[1-6]|br|strong|b|em|i|u|s|ul|ol|li|blockquote|table|img|a|span|pre|code|hr)\b[^>]*>/i.test(value);
  return sanitizeRichText(isHtml ? value : value.split(/\r?\n/).map((line) => `<p>${escapeText(line) || '<br>'}</p>`).join(''), allowLocalImages);
};
