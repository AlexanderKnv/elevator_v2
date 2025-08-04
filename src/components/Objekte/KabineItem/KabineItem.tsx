import React from 'react';
import './KabineItem.css';
import KabineImage from '../../../assets/Kabine.png';
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
        <div
            className="kabine-item"
            //@ts-ignore
            ref={dragRef}
            isDragging={isDragging}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={KabineImage} alt="Kabine" className="kabine-image" />
            <div className="kabine-label">Kabine</div>
        </div>
    );
};

export default KabineItem;
