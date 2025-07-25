import React from 'react';
import './EtageItem.css';
import EtagenImage from '../../../assets/Etagen.jpg';
import TooltipWrapper from '../../Shared/TooltipWrapper/TooltipWrapper';
import { useDrag } from 'react-dnd';

const EtageItem: React.FC = () => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'ETAGE',
    item: {},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <TooltipWrapper
      dragRef={dragRef}
      isDragging={isDragging}
      tooltipContent={<img src={EtagenImage} alt="Etage Vorschau" />}
    >
      <div
        className="etage-item"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="etage-icon">🏢</div>
        <div className="etage-label">Etage</div>
      </div>
    </TooltipWrapper>
  );
};

export default EtageItem;


