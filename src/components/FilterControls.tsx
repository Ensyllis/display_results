// Path: display_results/src/components/FilterControls.tsx
import React from 'react';
// No need for StatementType, AspectType from '../types' anymore for props

interface FilterControlsProps {
  sentimentFactualFocus: number; // 0 (Factual) to 100 (Sentiment)
  setSentimentFactualFocus: (value: number) => void;
  marginGrowthFocus: number; // 0 (Margin) to 100 (Growth)
  setMarginGrowthFocus: (value: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  sentimentFactualFocus, setSentimentFactualFocus,
  marginGrowthFocus, setMarginGrowthFocus
}) => {
  return (
    <div className="filter-controls-enhanced">
      <div className="filter-row">
        <label htmlFor="sentimentFactualSlider" className="filter-label" style={{flexBasis: 'auto', marginRight: '10px'}}>
          Factual ({100 - sentimentFactualFocus}%)
        </label>
        <input
          type="range"
          id="sentimentFactualSlider"
          min="0"
          max="100"
          value={sentimentFactualFocus}
          onChange={(e) => setSentimentFactualFocus(Number(e.target.value))}
          style={{ flexGrow: 1, margin: '0 10px' }}
          aria-label="Statement Type Focus: Left for Factual, Right for Sentiment"
        />
        <span className="filter-label" style={{flexBasis: 'auto', marginLeft: '0px'}}>
          Sentiment ({sentimentFactualFocus}%)
        </span>
      </div>

      <div className="filter-row" style={{marginTop: '1rem'}}>
        <label htmlFor="marginGrowthSlider" className="filter-label" style={{flexBasis: 'auto', marginRight: '10px'}}>
          Margin ({100 - marginGrowthFocus}%)
        </label>
        <input
          type="range"
          id="marginGrowthSlider"
          min="0"
          max="100"
          value={marginGrowthFocus}
          onChange={(e) => setMarginGrowthFocus(Number(e.target.value))}
          style={{ flexGrow: 1, margin: '0 10px' }}
          aria-label="Aspect Focus: Left for Margin, Right for Growth"
        />
        <span className="filter-label" style={{flexBasis: 'auto', marginLeft: '0px'}}>
          Growth ({marginGrowthFocus}%)
        </span>
      </div>
    </div>
  );
};

export default FilterControls;