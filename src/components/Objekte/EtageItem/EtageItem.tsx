/** @packageDocumentation
 * # Etage-Item (`EtageItem.tsx`)
 *
 * Draggable Palette-Element zum Hinzufügen einer Etage.
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'ETAGE'`, leere Payload).
 * - Bindet `dragRef` am Wurzel-Element und reduziert die Deckkraft während des Drag-Vorgangs.
 * - Rendert Icon und Beschriftung über `.etage-image` und `.etage-label`.
 * - Dient als reines Trigger-/Präsentations-Element; die eigentliche Logik erfolgt in den Drop-Zonen.
 */

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
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={EtagenImage} alt="Etage" className="etage-image" />
            <div className="etage-label">Etage</div>
        </div>
    );
};

export default EtageItem;


