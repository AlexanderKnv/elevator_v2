import React from 'react';
import './EtageItem.css';
import EtagenImage from '../../../assets/Etagen.jpg';
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
        <div
            className="etage-item"
            //@ts-ignore
            ref={dragRef}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={EtagenImage} alt="Etage" className="etage-image" />
            <div className="etage-label">Etage</div>
        </div>
    );
};

export default EtageItem;


