// src/components/VectorPlot.tsx
import React from 'react';

interface VectorPlotProps {
  sentimentScore: [number, number];
  factualScore: [number, number];
  width?: number;
  height?: number;
}

const VectorPlot: React.FC<VectorPlotProps> = ({
  sentimentScore,
  factualScore,
  width = 200, // Default width for the plot in the sidebar
  height = 200, // Default height
}) => {
  const viewBoxMinX = -7.3; // Adjusted slightly for more label room
  const viewBoxMinY = -6; // Adjusted slightly for more label room
  const viewBoxWidth = 14.5;  // Adjusted slightly for more label room
  const viewBoxHeight = 12; // Adjusted slightly for more label room

  const axisLimit = 5; // The actual limit for vectors

  const scaleAndFlipY = (coord: [number, number]): [number, number] => {
    const x = Math.max(-axisLimit, Math.min(axisLimit, coord[0]));
    const y = Math.max(-axisLimit, Math.min(axisLimit, coord[1]));
    return [x, -y]; // Flip Y for SVG
  };

  const [sX, sY_svg] = scaleAndFlipY(sentimentScore);
  const [fX, fY_svg] = scaleAndFlipY(factualScore);

  const vectorLabelFontSize = 0.55; // INCREASED font size for "Sentiment" and "Factual"
  const axisLabelFontSize = 0.55;  // Font size for "Growth", "Margin", etc.
  const tickFontSize = 0.3;     // Font size for the "0" tick

  return (
    <div className="vector-plot-container" style={{ width, height, border: '1px solid #ccc', backgroundColor: '#f0f0f0', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ fontFamily: 'sans-serif' }}
      >
        {/* Optional Grid lines (can be kept or removed) */}
        {[-4, -3, -2, -1, 1, 2, 3, 4].map(val => (
          <React.Fragment key={`grid-${val}`}>
            <line x1={val} y1={-axisLimit} x2={val} y2={axisLimit} stroke="#ddd" strokeWidth="0.05" />
            <line x1={-axisLimit} y1={-val} x2={axisLimit} y2={-val} stroke="#ddd" strokeWidth="0.05" />
          </React.Fragment>
        ))}

        {/* X-axis */}
        <line x1={-axisLimit} y1="0" x2={axisLimit} y2="0" stroke="#777" strokeWidth="0.1" />
        {/* Y-axis */}
        <line x1="0" y1={-axisLimit} x2="0" y2={axisLimit} stroke="#777" strokeWidth="0.1" />

        {/* Custom Axis Labels */}
        {/* X-axis labels */}
        <text
          x={axisLimit}
          y={0}
          dx={axisLabelFontSize * 0.75} // Offset to the right of the axis end
          dy={axisLabelFontSize * 0.35} // Vertically align with axis
          fontSize={axisLabelFontSize}
          textAnchor="start" // Align text start to the dx position
          fill="#333"
        >
          Growth
        </text>
        <text
          x={-axisLimit}
          y={0}
          dx={-axisLabelFontSize * 0.75} // Offset to the left of the axis end
          dy={axisLabelFontSize * 0.35}  // Vertically align with axis
          fontSize={axisLabelFontSize}
          textAnchor="end" // Align text end to the dx position
          fill="#333"
        >
          Margin
        </text>

        {/* Y-axis labels (remember Y is flipped in SVG) */}
        <text
          x={0}
          y={-axisLimit} // Top of the Y-axis (data positive)
          dy={-axisLabelFontSize * 0.75} // Offset above the axis end
          fontSize={axisLabelFontSize}
          textAnchor="middle" // Center text on the Y-axis
          fill="#333"
        >
          Excited
        </text>
        <text
          x={0}
          y={axisLimit} // Bottom of the Y-axis (data negative)
          dy={axisLabelFontSize * 1.5} // Offset below the axis end
          fontSize={axisLabelFontSize}
          textAnchor="middle" // Center text on the Y-axis
          fill="#333"
        >
          Worried
        </text>

        {/* Origin Tick Label "0" */}
        <text
            x={0}
            y={0}
            dx={tickFontSize * 0.75} // Offset slightly right of origin
            dy={tickFontSize * 2}   // Offset slightly below origin
            fontSize={tickFontSize}
            textAnchor="start"
            fill="#555"
          >
            0
          </text>

        {/* Origin Point */}
        <circle cx="0" cy="0" r="0.1" fill="#333" /> {/* Made origin point slightly darker */}

        {/* Sentiment Vector (Purple) */}
        <line
          x1="0"
          y1="0"
          x2={sX}
          y2={sY_svg}
          stroke="purple"
          strokeWidth="0.25" // Slightly thicker vector
          markerEnd="url(#arrow-purple)"
        />
        <text
          x={sX}
          y={sY_svg}
          dx={sX === 0 ? (sY_svg > 0 ? -vectorLabelFontSize*1.5 : vectorLabelFontSize*1.5) : (sX > 0 ? 0.3 : -0.3)} // Adjust offset
          dy={sY_svg === 0 ? (sX > 0 ? -vectorLabelFontSize*0.5 : vectorLabelFontSize*0.5) : (sY_svg > 0 ? 0.6 : -0.4)} // Adjust offset, remember y is flipped
          fill="purple"
          fontSize={vectorLabelFontSize} // INCREASED
          textAnchor={sX === 0 ? "middle" : (sX > 0 ? "start" : "end")}
          dominantBaseline="middle"
          fontWeight="bold" // Make it bolder
        >
          Sentiment
        </text>
        <defs>
          <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="purple" />
          </marker>
        </defs>

        {/* Factual Score Vector (Green) */}
        <line
          x1="0"
          y1="0"
          x2={fX}
          y2={fY_svg}
          stroke="green"
          strokeWidth="0.25" // Slightly thicker vector
          markerEnd="url(#arrow-green)"
        />
        <text
          x={fX}
          y={fY_svg}
          dx={fX === 0 ? (fY_svg > 0 ? -vectorLabelFontSize*1.5 : vectorLabelFontSize*1.5) : (fX > 0 ? 0.3 : -0.3)} // Adjust offset
          dy={fY_svg === 0 ? (fX > 0 ? -vectorLabelFontSize*0.5 : vectorLabelFontSize*0.5) : (fY_svg > 0 ? 0.6 : -0.4)} // Adjust offset
          fill="green"
          fontSize={vectorLabelFontSize} // INCREASED
          textAnchor={fX === 0 ? "middle" : (fX > 0 ? "start" : "end")}
          dominantBaseline="middle"
          fontWeight="bold" // Make it bolder
        >
          Factual
        </text>
        <defs>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="green" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default VectorPlot;