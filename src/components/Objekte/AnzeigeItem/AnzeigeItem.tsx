import React from 'react';
import './AnzeigeItem.css';
import AnzeigeImage from '../../../assets/Anzeige.png';
import TooltipWrapper from '../../Shared/TooltipWrapper/TooltipWrapper';
import { useDrag } from 'react-dnd';

const AnzeigeItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'ANZEIGE',
        item: {},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <TooltipWrapper
            dragRef={dragRef}
            isDragging={isDragging}
            tooltipContent={<img src={AnzeigeImage} alt="Anzeige Vorschau" />}
        >
            <div
                className="anzeige-item"
                style={{ opacity: isDragging ? 0.5 : 1 }}
            >
                <div className="anzeige-icon">⬇️</div>
                <div className="anzeige-label">Anzeige</div>
            </div>
        </TooltipWrapper>
    );
};

export default AnzeigeItem;