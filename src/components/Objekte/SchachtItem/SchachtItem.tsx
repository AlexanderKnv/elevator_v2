import './SchachtItem.css';
import { useDrag } from 'react-dnd';
import SchachtImage from '../../../assets/Schacht.jpg';

const SchachtItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'SCHACHT',
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            //@ts-ignore
            ref={dragRef}
            className="schacht-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={SchachtImage} alt="Schacht" className="schacht-image" />
            <div className="schacht-label">Schacht</div>
        </div>
    );
};

export default SchachtItem;