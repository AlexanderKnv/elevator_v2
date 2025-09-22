/** @packageDocumentation
 * # Anzeige-Item (Drag Source) (`AnzeigeItem.tsx`)
 *
 * Draggable-Element zum Platzieren einer **Anzeige**.
 *
 * - Initialisiert eine Drag-Quelle mit `useDrag` (Typ: `'ANZEIGE'`).
 * - Übergibt eine leere Payload (`item: {}`); Kontext wird von der Drop-Zone bestimmt.
 * - Gibt visuelles Feedback über die Deckkraft (`opacity 0.5`), solange gezogen wird.
 */

import React from 'react';
import './AnzeigeItem.css';
import AnzeigeImage from '../../../assets/Anzeige.jpg';
import { useDrag } from 'react-dnd';

const AnzeigeItem: React.FC = () => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'ANZEIGE',
        item: {},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            className="anzeige-item"
            //@ts-ignore
            ref={dragRef}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <img src={AnzeigeImage} alt="Anzeige" className="anzeige-image" />
            <div className="anzeige-label">Anzeige</div>
        </div>
    );
};

export default AnzeigeItem;
