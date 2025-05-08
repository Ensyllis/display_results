// src/components/FilterControls.tsx
import React from 'react';
import { StatementType, AspectType } from '../types';
// If you create a separate FilterControls.css, import it here:
// import './FilterControls.css';

interface FilterControlsProps {
  statementType: StatementType;
  setStatementType: (type: StatementType) => void;
  aspectType: AspectType;
  setAspectType: (type: AspectType) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  statementType, setStatementType, aspectType, setAspectType
}) => {
  return (
    // Using a new root class to avoid conflicts if old '.filter-controls' styles exist elsewhere
    <div className="filter-controls-enhanced">
      <div className="filter-row">
        <label htmlFor="statementTypeControl" className="filter-label">Statement Type:</label>
        <div className="segmented-control" id="statementTypeControl">
          <button
            onClick={() => setStatementType("Sentiment")}
            className={statementType === "Sentiment" ? 'active' : ''}
            disabled={statementType === "Sentiment"} // Keeps it unclickable but visually active
            aria-pressed={statementType === "Sentiment"}
          >
            Sentiment
          </button>
          <button
            onClick={() => setStatementType("Factual")}
            className={statementType === "Factual" ? 'active' : ''}
            disabled={statementType === "Factual"}
            aria-pressed={statementType === "Factual"}
          >
            Factual
          </button>
        </div>
      </div>

      <div className="filter-row">
        <label htmlFor="aspectTypeControl" className="filter-label">Aspect:</label>
        <div className="segmented-control" id="aspectTypeControl">
          <button
            onClick={() => setAspectType("Margin")}
            className={aspectType === "Margin" ? 'active' : ''}
            disabled={aspectType === "Margin"}
            aria-pressed={aspectType === "Margin"}
          >
            Margin
          </button>
          <button
            onClick={() => setAspectType("Growth")}
            className={aspectType === "Growth" ? 'active' : ''}
            disabled={aspectType === "Growth"}
            aria-pressed={aspectType === "Growth"}
          >
            Growth
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;