// Path: display_results/src/utils/highlightHelper.tsx
import React from 'react';
import { PhraseToHighlight } from '../types';

export const excitedColors: { [key: number]: string } = {
  5: "#2f9e44", 4: "#40c057", 3: "#69db7c", 2: "#b2f2bb", 1: "#ebfbee",
};
export const worriedColors: { [key: number]: string } = {
  5: "#e03131", 4: "#fa5252", 3: "#ff8787", 2: "#ffc9c9", 1: "#fff5f5",
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
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

  const normalizeSearchableString = (str: string): string => {
    // ... (normalization logic remains the same)
    return str
      .toLowerCase()
      .replace(/\u00A0/g, ' ')
      .replace(/â\x80\x93/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };

  let remainingText = text;
  const parts: (string | React.JSX.Element)[] = [];
  let keyCounter = 0;
  const sortedPhrases = [...phrasesToHighlight]; 

  while (remainingText.length > 0) {
    let foundThisIteration = false;
    let bestMatch: {
        actualStartIndex: number;
        phraseInfo: PhraseToHighlight;
        originalTextToHighlight: string;
    } | null = null;

    for (let i = 0; i < sortedPhrases.length; i++) {
      const phraseInfo = sortedPhrases[i];
      const normalizedSearchablePhraseText = normalizeSearchableString(phraseInfo.text);
      if (normalizedSearchablePhraseText.length === 0) continue;

      let actualStartIndex = -1;
      const originalPhraseLength = phraseInfo.text.length;
      let searchFromIndex = 0;
      while(searchFromIndex < remainingText.length) {
          const potentialStartIndex = remainingText.toLowerCase().indexOf(phraseInfo.text.charAt(0).toLowerCase(), searchFromIndex);
          if (potentialStartIndex === -1) break;
          const subAhead = remainingText.substring(potentialStartIndex, potentialStartIndex + originalPhraseLength);
          if (normalizeSearchableString(subAhead) === normalizedSearchablePhraseText) {
              actualStartIndex = potentialStartIndex;
              break;
          }
          searchFromIndex = potentialStartIndex + 1;
      }

      if (actualStartIndex !== -1) {
        if (bestMatch === null || actualStartIndex < bestMatch.actualStartIndex) {
          bestMatch = {
            actualStartIndex,
            phraseInfo,
            originalTextToHighlight: remainingText.substring(actualStartIndex, actualStartIndex + phraseInfo.text.length) 
          };
        }
      }
    }


    if (bestMatch) {
      const before = remainingText.substring(0, bestMatch.actualStartIndex);
      if (before) parts.push(before);

      const baseHexColor = getHighlightColor(bestMatch.phraseInfo.score, bestMatch.phraseInfo.isWorried);
      const rgbColor = hexToRgb(baseHexColor);
      const effectiveOpacity = (typeof bestMatch.phraseInfo.opacity === 'number') 
                               ? Math.max(0, Math.min(1, bestMatch.phraseInfo.opacity)) 
                               : 1;
      let finalBackgroundColor = baseHexColor;
      if (rgbColor) {
        finalBackgroundColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${effectiveOpacity})`;
      }

      // Prepare the score display
      // We use Math.abs because color/isWorried already indicates sentiment direction.
      // .toFixed(1) ensures one decimal place, e.g., 3.0, 4.5.
      const scoreDisplay = Math.abs(bestMatch.phraseInfo.score).toFixed(1);

      parts.push(
        <span
          key={`highlight-${normalizeSearchableString(bestMatch.phraseInfo.text)}-${keyCounter++}`}
          style={{
            backgroundColor: finalBackgroundColor,
            color: '#212529', 
            padding: '0.1em 0.2em', // Padding for the main text
            borderRadius: '0.3em',
          }}
          title={`Category: ${bestMatch.phraseInfo.categoryKey}\nScore: ${bestMatch.phraseInfo.score}\nBG Opacity: ${effectiveOpacity.toFixed(2)}`}
        >
          {bestMatch.originalTextToHighlight}
          <sup style={{
            fontSize: '75%',          // Make it smaller than the parent text
            fontWeight: '600',        // A bit bold to make the number clear
            color: 'inherit',         // Inherit the text color of the parent span (#212529)
            marginLeft: '3px',        // A little space after the phrase
            padding: '0px 2px',       // Tiny padding around the number itself
            borderRadius: '2px',      // Slightly rounded corners for the number's optional background
            // backgroundColor: 'rgba(0, 0, 0, 0.05)', // Optional: very subtle background for the number if needed
            userSelect: 'none',       // Prevent selecting just the score
            // --- Precise positioning for superscript ---
            position: 'relative',     // Needed for 'top' positioning
            verticalAlign: 'baseline',// Reset default superscript vertical alignment
            lineHeight: '0',          // Prevents sup from affecting main line height
            top: '-0.5em',            // Adjust to raise it like a superscript
          }}>
            {scoreDisplay}
          </sup>
        </span>
      );
      remainingText = remainingText.substring(bestMatch.actualStartIndex + bestMatch.originalTextToHighlight.length);
      foundThisIteration = true;
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