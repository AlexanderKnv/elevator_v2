import React from 'react';
import './SystemBereich.css';
import EtageZone from '../EtageZone/EtageZone';

const SystemBereich: React.FC = () => {
  return (
    <div className="system-bereich">
      <div className="system-head">System-Bereich</div>
      <EtageZone />
    </div>
  );
};

export default SystemBereich;
