import './RuftasteItem.css';
import { useDrag } from 'react-dnd';
import RuftasteImage from '../../../assets/Ruftaste.jpg';

const RuftasteItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'RUFTASTE',
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            //@ts-ignore
            ref={dragRef}
            isDragging={isDragging}
            className="ruftaste-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={RuftasteImage} alt="Ruftaste" className="ruftaste-image" />
            <div className="ruftaste-label">Ruftaste</div>
        </div>
    );
};

export default RuftasteItem;
