/** @packageDocumentation
 * # Ruftaste-Item (`RuftasteItem.tsx`)
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'RUFTASTE'`, ohne Payload).
 * - Bindet `dragRef` am Wurzel-Element; verringert die Deckkraft während des Drag-Vorgangs.
 * - Rendert Icon und Beschriftung über `.ruftaste-image` und `.ruftaste-label`.
 */

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
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            className="ruftaste-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={RuftasteImage} alt="Ruftaste" className="ruftaste-image" />
            <div className="ruftaste-label">Ruftaste</div>
        </div>
    );
};

export default RuftasteItem;
