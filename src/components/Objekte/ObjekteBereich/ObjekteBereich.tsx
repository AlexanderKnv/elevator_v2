import React from 'react';
import EtageItem from '../EtageItem/EtageItem';
import KabineItem from '../KabineItem/KabineItem';
import RuftasteItem from '../RuftasteItem/RuftasteItem';
import AnzeigeItem from '../AnzeigeItem/AnzeigeItem';

const ObjekteBereich: React.FC = () => {
    return (
        <div className="objekte-bereich">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <EtageItem />
                <KabineItem />
                <RuftasteItem />
                <AnzeigeItem />
            </div>
        </div>
    );
};

export default ObjekteBereich;
