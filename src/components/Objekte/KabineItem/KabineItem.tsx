import React from 'react';
import './KabineItem.css';
import KabineImage from '../../../assets/Kabine.png';
import TooltipWrapper from '../../Shared/TooltipWrapper/TooltipWrapper';
import { useDrag } from 'react-dnd';

const KabineItem: React.FC = () => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'KABINE',
    item: {},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <TooltipWrapper
      dragRef={dragRef}
      isDragging={isDragging}
      tooltipContent={<img src={KabineImage} alt="Kabine Vorschau" />}
    >
      <div
        className="kabine-item"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="kabine-icon">🚪</div>
        <div className="kabine-label">Kabine</div>
      </div>
    </TooltipWrapper>
  );
};

export default KabineItem;
