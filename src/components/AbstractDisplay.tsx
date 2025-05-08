import React from 'react';
import { PhraseToHighlight } from '../types';
import { highlightText } from '../utils/highlightHelper';

interface AbstractDisplayProps {
  abstract: string;
  phrasesToHighlight: PhraseToHighlight[];
}

const AbstractDisplay: React.FC<AbstractDisplayProps> = ({ abstract, phrasesToHighlight }) => {
  const content = highlightText(abstract, phrasesToHighlight);
  return <div className="abstract-display">{content}</div>;
};

export default AbstractDisplay;