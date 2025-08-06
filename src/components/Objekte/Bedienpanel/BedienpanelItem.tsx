import React from 'react';
import './BedienpanelItem.css';
import BedienpanelImage from '../../../assets/Bedienpanel.jpg';
import { useDrag } from 'react-dnd';

const BedienpanelItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'BEDIENPANEL',
        item: {},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            className="bedienpanel-item"
            //@ts-ignore
            ref={dragRef}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={BedienpanelImage} alt="Bedienpanel" className="bedienpanel-image" />
            <div className="bedienpanel-label">Bedienpanel</div>
        </div>
    );
};

export default BedienpanelItem;