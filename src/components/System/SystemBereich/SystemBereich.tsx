import React from 'react';
import './SystemBereich.css';
import EtageZone from '../EtageZone/EtageZone';

import KabinenZone from '../KabinenZone/KabinenZone';


const SystemBereich: React.FC = () => {
  return (
    <div className="system-bereich">
      {/* <div className="system-head">System-Bereich</div> */}
      <EtageZone />
      <KabinenZone />
    </div>
  );
};

export default SystemBereich;




  // const [{ isOver }, dropRef] = useDrop(() => ({
  //   accept: ['ETAGE', 'KABINE'],
  //   drop: (item, monitor: DropTargetMonitor<unknown, void>) => {
  //     const type = monitor.getItemType();
  //     if(type === 'ETAGE') {
  //       dispatch(addEtage());
  //     }
  //     if(type === 'KABINE' && etagen.length > 0 && kabinen.length < 1) {
  //         console.log('KABINE dropped!');
  //       dispatch(addKabine({ etage: 1 })); // Всегда добавляем на первый этаж
  //     }
  //   },
  //   collect: (monitor: DropTargetMonitor<unknown, void>) => ({
  //     isOver: monitor.isOver(),
  //   }),
  // }));