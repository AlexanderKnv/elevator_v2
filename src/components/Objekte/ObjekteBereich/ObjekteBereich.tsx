import React from 'react';
import EtageItem from '../EtageItem/EtageItem';
import KabineItem from '../KabineItem/KabineItem';


const ObjekteBereich: React.FC = () => {
  return (
    <div className="objekte-bereich">
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <EtageItem />
        <KabineItem/>
      </div>
    </div>
  );
};

export default ObjekteBereich;
