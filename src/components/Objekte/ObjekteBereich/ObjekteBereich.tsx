/** @packageDocumentation
 * # Objekte-Bereich (`ObjekteBereich.tsx`)
 *
 * Palette/Werkzeugbereich zum Hinzufügen und Aufräumen von Objekten.
 *
 * - Rendert Aktionsbuttons: **Add All** → `dispatch(addAll())`, **Clear All** → `dispatch(clearAll())`.
 * - Stellt die Objektpalette dar: `<EtageItem />`, `<SchachtItem />`, `<AnzeigeItem />`, `<RuftasteItem />`, `<KabineItem />`, `<BedienpanelItem />`.
 */

import React from 'react';
import EtageItem from '../EtageItem/EtageItem';
import KabineItem from '../KabineItem/KabineItem';
import RuftasteItem from '../RuftasteItem/RuftasteItem';
import AnzeigeItem from '../AnzeigeItem/AnzeigeItem';
import BedienpanelItem from '../Bedienpanel/BedienpanelItem';
import SchachtItem from '../SchachtItem/SchachtItem';
import './ObjekteBereich.css';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/store';
import { addAll, clearAll } from './addClearAll';

const ObjekteBereich: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const handleAddAll = () => {
        dispatch(addAll());
    }

    const handleClearAll = () => {
        dispatch(clearAll());
    }

    return (
        <div className="objekte-bereich">
            <div className='button-container'>
                <button className='dark-btn' onClick={handleAddAll}>Add All</button>
                <button className='dark-btn' onClick={handleClearAll}>Clear All</button>
            </div>
            <div className="objekte-container">
                <EtageItem />
                <SchachtItem />
                <AnzeigeItem />
                <RuftasteItem />
                <KabineItem />
                <BedienpanelItem />
            </div>
        </div>
    );
};

export default ObjekteBereich;
