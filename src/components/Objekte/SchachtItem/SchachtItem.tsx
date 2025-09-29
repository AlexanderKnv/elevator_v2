/** @packageDocumentation
 * # Schacht-Item (`SchachtItem.tsx`)
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'SCHACHT'`, ohne Payload).
 * - Bindet `dragRef` am Wurzel-Element und reduziert die Deckkraft während des Drag-Vorgangs.
 * - Rendert Bild und Beschriftung über `.schacht-image` und `.schacht-label`.
 * - Dient als reines Palette-/Trigger-Element; die eigentliche Platzierung erfolgt in den Drop-Zonen.
 */

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
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            className="schacht-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={SchachtImage} alt="Schacht" className="schacht-image" />
            <div className="schacht-label">Schacht</div>
        </div>
    );
};

export default SchachtItem;