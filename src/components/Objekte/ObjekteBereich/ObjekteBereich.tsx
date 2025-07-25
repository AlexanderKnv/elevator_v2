import React from 'react';
import EtageItem from '../EtageItem/EtageItem';


const ObjekteBereich: React.FC = () => {
  return (
    <div className="objekte-bereich">
      <h3>Objekte-Bereich</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <EtageItem />
      </div>
    </div>
  );
};

export default ObjekteBereich;
