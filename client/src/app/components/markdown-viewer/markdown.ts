import { marked } from 'marked';
import hljs from 'highlight.js';

function markdown(text: string, theme = 'dracula') {
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
      hljs.configure({ classPrefix: `${theme}-` });
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: `hljs ${theme} language-`,
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });
  return marked.parse(text);
}

export default markdown;
