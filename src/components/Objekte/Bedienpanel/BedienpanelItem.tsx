/** @packageDocumentation
 * # Bedienpanel-Item (`BedienpanelItem.tsx`)
 *
 * Draggable Palette-Element zum Hinzufügen eines Bedienpanels.
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'BEDIENPANEL'`, leere Payload).
 * - Bindet `dragRef` am Wurzel-Element; reduziert die Deckkraft (`opacity 0.5`) während des Drag-Vorgangs.
 * - Rendert Icon und Beschriftung über die Klassen `.bedienpanel-image` und `.bedienpanel-label`.
 * - Dient ausschließlich als Präsentations-/Trigger-Komponente; die eigentliche Zuordnung passiert in den Drop-Zonen.
 */

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
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={BedienpanelImage} alt="Bedienpanel" className="bedienpanel-image" />
            <div className="bedienpanel-label">Bedienpanel</div>
        </div>
    );
};

export default BedienpanelItem;