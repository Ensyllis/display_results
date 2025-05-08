// src/utils/highlightHelper.tsx
// CRITICAL:
// 1. This file MUST have a .tsx extension (e.g., highlightHelper.tsx).
// 2. Your tsconfig.json MUST have the "jsx" compiler option set, e.g., "jsx": "react-jsx".
//    Example tsconfig.json compilerOptions:
//    {
//      "compilerOptions": {
//        "jsx": "react-jsx", // Or "react" for older setups
//        // ... other options
//      }
//    }
// 3. You MUST restart your development server after ensuring the above.
//    If problems persist, try deleting node_modules, package-lock.json/yarn.lock,
//    re-running npm install / yarn install, and then restarting the server.

import React from 'react'; // Necessary for JSX transformation and recognition
import { PhraseToHighlight } from '../types';

export const excitedColors: { [key: number]: string } = {
  5: "#2f9e44", 4: "#40c057", 3: "#69db7c", 2: "#b2f2bb", 1: "#ebfbee",
};
export const worriedColors: { [key: number]: string } = {
  5: "#e03131", 4: "#fa5252", 3: "#ff8787", 2: "#ffc9c9", 1: "#fff5f5",
};

export function getHighlightColor(score: number, isWorried: boolean): string {
  const absScore = Math.max(1, Math.min(5, Math.round(Math.abs(score))));
  if (isWorried) {
    return worriedColors[absScore] || worriedColors[1];
  }
  return excitedColors[absScore] || excitedColors[1];
}

export const highlightText = (text: string, phrasesToHighlight: PhraseToHighlight[]): (string | React.JSX.Element)[] => {
  if (!text || phrasesToHighlight.length === 0) {
    return [text];
  }

  let remainingText = text;
  const parts: (string | React.JSX.Element)[] = []; // JSX.Element type requires React in scope and TSX processing
  let keyCounter = 0;
  const sortedPhrases = [...phrasesToHighlight];

  while (remainingText.length > 0) {
    let foundThisIteration = false;
    for (let i = 0; i < sortedPhrases.length; i++) {
      const phraseInfo = sortedPhrases[i];
      const startIndex = remainingText.toLowerCase().indexOf(phraseInfo.text.toLowerCase());

      if (startIndex !== -1) {
        const before = remainingText.substring(0, startIndex);
        const originalPhraseText = remainingText.substring(startIndex, startIndex + phraseInfo.text.length);

        if (before) parts.push(before);

        // The following is JSX. If TypeScript reports "span is not defined" or "key is not defined",
        // it means this file is NOT being processed as a TSX file correctly.
        // Ensure file extension is .tsx and tsconfig.json has "jsx" option set.
        parts.push(
          <span // This is a JSX element
            key={`highlight-${phraseInfo.text}-${keyCounter++}`} // 'key' is a special React prop
            style={{ // 'style' is a special React prop expecting an object
              backgroundColor: getHighlightColor(phraseInfo.score, phraseInfo.isWorried),
              padding: '0.1em 0.2em',
              borderRadius: '0.2em',
            }}
            title={`Category: ${phraseInfo.categoryKey}\nScore: ${phraseInfo.score}`} // 'title' is a standard HTML attribute
          >
            {originalPhraseText}
          </span>
        );

        remainingText = remainingText.substring(startIndex + phraseInfo.text.length);
        foundThisIteration = true;
        break;
      }
    }

    if (!foundThisIteration) {
      if (remainingText) parts.push(remainingText);
      break;
    }
  }

  if (parts.length === 0 && text) {
    return [text];
  }

  return parts;
};
