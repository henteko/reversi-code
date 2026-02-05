import React from "react";
import { COLORS } from "../theme.js";

const KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "this", "class",
  "extends", "import", "export", "default", "typeof", "instanceof",
  "true", "false", "null", "undefined", "void", "type", "interface",
]);

const TYPES = new Set([
  "number", "string", "boolean", "any", "void", "never", "unknown", "object",
]);

interface Token {
  text: string;
  color: string;
}

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comments
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), color: COLORS.comment });
      break;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j++;
        j++;
      }
      tokens.push({ text: line.slice(i, j + 1), color: COLORS.string });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || /[\s([\]{},;:+\-*/%=<>!&|^~?]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: COLORS.number });
      i = j;
      continue;
    }

    // Words (keywords, types, identifiers)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, color: COLORS.keyword });
      } else if (TYPES.has(word)) {
        tokens.push({ text: word, color: COLORS.type });
      } else if (j < line.length && line[j] === "(") {
        tokens.push({ text: word, color: COLORS.function });
      } else {
        tokens.push({ text: word, color: COLORS.editorText });
      }
      i = j;
      continue;
    }

    // Other characters
    tokens.push({ text: line[i], color: COLORS.editorText });
    i++;
  }

  return tokens;
}

interface SyntaxHighlighterProps {
  line: string;
}

export function SyntaxHighlighter({ line }: SyntaxHighlighterProps) {
  const tokens = tokenizeLine(line);
  if (tokens.length === 0) return <text> </text>;

  return (
    <text>
      {tokens.map((token, i) => (
        <span key={i} fg={token.color}>
          {token.text}
        </span>
      ))}
    </text>
  );
}
