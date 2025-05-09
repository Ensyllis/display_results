// Path: display_results/src/utils/highlightHelper.tsx
import React from 'react';
import { PhraseToHighlight } from '../types';

export const excitedColors: { [key: number]: string } = {
  5: "#2f9e44", 4: "#40c057", 3: "#69db7c", 2: "#b2f2bb", 1: "#ebfbee",
};
export const worriedColors: { [key: number]: string } = {
  5: "#e03131", 4: "#fa5252", 3: "#ff8787", 2: "#ffc9c9", 1: "#fff5f5",
};

export function getHighlightColor(score: number, isWorried: boolean): string {
  // Ensure score is treated as absolute for color intensity, and clamped.
  // Original score could be e.g. -5 to 5. abs() makes it 0 to 5.
  // Math.round() + Math.max(1, ..) ensures it's an integer from 1 to 5.
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
  // Sort by length descending to match longer phrases first, if that's desired,
  // though current logic finds the *earliest* best match.
  // Sorting might not be strictly necessary with the current "bestMatch" logic that prioritizes earlier start index.
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
      // Skip if opacity is effectively zero (already filtered in DocumentViewer, but as a safeguard)
      if (phraseInfo.opacity < 0.01) continue;


      const normalizedSearchablePhraseText = normalizeSearchableString(phraseInfo.text);
      if (normalizedSearchablePhraseText.length === 0) continue;

      let actualStartIndex = -1;
      const originalPhraseLength = phraseInfo.text.length; // Use original phrase length

      // Find the phrase in the remainingText using a case-insensitive search for the first character,
      // then comparing the normalized substring.
      // This is a revised loop to find the true start of the non-normalized phrase
      // by normalizing substrings of remainingText for comparison.
      let searchFromIndex = 0;
      while(searchFromIndex < remainingText.length) {
          // Attempt to find the start of the phrase (case-insensitive for the first char of phraseInfo.text for robustness)
          const potentialStartIndex = remainingText.toLowerCase().indexOf(phraseInfo.text.charAt(0).toLowerCase(), searchFromIndex);
          
          if (potentialStartIndex === -1) break; // First char not found, phrase cannot be in remainingText

          // Extract a substring of original remainingText that has the same length as the original phrase.text
          const subAhead = remainingText.substring(potentialStartIndex, potentialStartIndex + originalPhraseLength);
          
          // Normalize this extracted substring and compare with the normalized phrase we're looking for
          if (normalizeSearchableString(subAhead) === normalizedSearchablePhraseText) {
              actualStartIndex = potentialStartIndex;
              break; // Found a match
          }
          searchFromIndex = potentialStartIndex + 1; // Continue search from next position
      }


      if (actualStartIndex !== -1) {
        if (bestMatch === null || actualStartIndex < bestMatch.actualStartIndex) {
          bestMatch = {
            actualStartIndex,
            phraseInfo,
            // Crucially, use the substring from the *original* remainingText
            originalTextToHighlight: remainingText.substring(actualStartIndex, actualStartIndex + phraseInfo.text.length) 
          };
        }
      }
    }

    if (bestMatch) {
      const before = remainingText.substring(0, bestMatch.actualStartIndex);
      if (before) parts.push(before);

      parts.push(
        <span
          key={`highlight-${normalizeSearchableString(bestMatch.phraseInfo.text)}-${keyCounter++}`}
          style={{
            backgroundColor: getHighlightColor(bestMatch.phraseInfo.score, bestMatch.phraseInfo.isWorried),
            opacity: bestMatch.phraseInfo.opacity, // Apply opacity here
            padding: '0.1em 0.2em', // Minimal padding for better text flow with opacity
            borderRadius: '0.3em',
            // Transition for smooth opacity changes if phrases re-render often with different opacities
            // transition: 'opacity 0.3s ease-in-out', // Optional: for smoother visual updates
          }}
          title={`Category: ${bestMatch.phraseInfo.categoryKey}\nScore: ${bestMatch.phraseInfo.score}\nOpacity: ${bestMatch.phraseInfo.opacity.toFixed(2)}`}
        >
          {bestMatch.originalTextToHighlight}
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
  
  if (parts.length === 0 && text) { // Should only happen if text exists but no phrases or all phrases have 0 opacity
    return [text];
  }
  return parts;
};