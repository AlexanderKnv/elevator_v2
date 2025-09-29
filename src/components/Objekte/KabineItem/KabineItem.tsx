/** @packageDocumentation
 * # Kabine-Item (`KabineItem.tsx`)
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'KABINE'`, leere Payload).
 * - Bindet `dragRef` am Wurzel-Element und reduziert die Deckkraft während des Drag-Vorgangs.
 * - Rendert Bild und Beschriftung über `.kabine-image` und `.kabine-label`.
 * - Dient als reines Palette-/Trigger-Element; die eigentliche Logik erfolgt in den Drop-Zonen.
 */

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
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={KabineImage} alt="Kabine" className="kabine-image" />
            <div className="kabine-label">Kabine</div>
        </div>
    );
};

export default KabineItem;
