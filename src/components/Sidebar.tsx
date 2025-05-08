import React from 'react';
import { PhraseToHighlight, DocumentData } from '../types'; // Assuming Scores type is part of DocumentData

interface SidebarProps {
  documentTitle: string;
  scores: DocumentData['scores'];
  phrases: PhraseToHighlight[]; // For listing in sidebar if needed, or could be different structure
  onPhraseClick: (phrase: PhraseToHighlight) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ documentTitle, scores, phrases, onPhraseClick }) => {
  // Simplified vector plot: Map scores to a 0-100% scale for positioning
  // X = Sentiment, Y = Factual. Scores are arrays like [pos, neg]
  // Net score: sum of elements. Assuming scores are already scaled or need to be mapped to -5 to 5.
  // Let's assume scores need to be normalized to the -5 to 5 range for the plot
  const normalizeScore = (scoreArr: [number, number], range: number = 5): number => {
    // This is a placeholder. You'll need a robust way to get a single value.
    // E.g., sum, or if one is always pos and other neg, then sum.
    // If they represent magnitudes, it's more complex.
    // For this example, let's sum them and clamp.
    let val = scoreArr[0] + scoreArr[1];
    return Math.max(-range, Math.min(range, val));
  };

  const excitedColors: { [key: number]: string } = {
    5: "#2f9e44", 4: "#40c057", 3: "#69db7c", 2: "#b2f2bb", 1: "#ebfbee",
  };
  
  const worriedColors: { [key: number]: string } = {
    5: "#e03131", 4: "#fa5252", 3: "#ff8787", 2: "#ffc9c9", 1: "#fff5f5",
  };

  const sentimentX = normalizeScore(scores.Sentiment_Score);
  const factualY = normalizeScore(scores.Factual_Score); // Y-axis, so higher is "up"

  // Convert to percentage for positioning (0,0 is center of plot)
  // (score + range) / (2 * range) * 100
  const pointXPercent = ((sentimentX + 5) / 10) * 100;
  const pointYPercent = 100 - (((factualY + 5) / 10) * 100); // Invert Y for typical screen coords


  return (
    <aside className="sidebar">
      <h3>{documentTitle}</h3>

      <h4>Overall Scores:</h4>
      <div className="vector-plot-container" title={`Sentiment: ${sentimentX.toFixed(2)}, Factual: ${factualY.toFixed(2)}`}>
        <div className="vector-plot-axis x-axis"></div>
        <div className="vector-plot-axis y-axis"></div>
        <div
          className="vector-plot-point"
          style={{ left: `${pointXPercent}%`, top: `${pointYPercent}%` }}
        ></div>
        {/* Add axis labels -5, 0, 5 if desired */}
      </div>
      <p>Sentiment Score (X): {sentimentX.toFixed(2)}</p>
      <p>Factual Score (Y): {factualY.toFixed(2)}</p>


      <h4>Extracted Phrases (Filtered):</h4>
      {phrases.length > 0 ? (
        <ul>
          {phrases.map((p, index) => (
            <li key={index} onClick={() => onPhraseClick(p)} style={{ cursor: 'pointer', marginBottom:'5px', padding:'3px', background: p.isWorried? worriedColors[1] : excitedColors[1] }}>
              "{p.text}" (Score: {p.score})
            </li>
          ))}
        </ul>
      ) : (
        <p>No phrases match current filters.</p>
      )}
    </aside>
  );
};
export default Sidebar;