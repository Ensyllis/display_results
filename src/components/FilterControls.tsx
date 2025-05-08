import React from 'react';
import { StatementType, AspectType } from '../types';

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
    <div className="filter-controls">
      <div>
        <label>Statement Type: </label>
        <button onClick={() => setStatementType("Sentiment")} disabled={statementType === "Sentiment"}>Sentiment</button>
        <button onClick={() => setStatementType("Factual")} disabled={statementType === "Factual"}>Factual</button>
      </div>
      <div style={{marginTop: '10px'}}>
        <label>Aspect: </label>
        <button onClick={() => setAspectType("Margin")} disabled={aspectType === "Margin"}>Margin</button>
        <button onClick={() => setAspectType("Growth")} disabled={aspectType === "Growth"}>Growth</button>
      </div>
    </div>
  );
};
export default FilterControls;