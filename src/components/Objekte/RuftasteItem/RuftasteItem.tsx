import './RuftasteItem.css';
import { useDrag } from 'react-dnd';
import RuftasteImage from '../../../assets/Ruftaste.jpg';
import TooltipWrapper from '../../Shared/TooltipWrapper/TooltipWrapper';

const RuftasteItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'RUFTASTE',
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <TooltipWrapper
            dragRef={dragRef}
            isDragging={isDragging}
            tooltipContent={<img src={RuftasteImage} alt="Ruftaste Vorschau" />}>
            <div
                className="ruftaste-item"
                style={{ opacity: isDragging ? 0.5 : 1 }}
            >
                <div className="ruftaste-icon">🔘</div>
                <div className="ruftaste-label">Ruftaste</div>
            </div>
        </TooltipWrapper>
    );
};

export default RuftasteItem;
