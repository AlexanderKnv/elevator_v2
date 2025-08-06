import React from 'react';
import EtageItem from '../EtageItem/EtageItem';
import KabineItem from '../KabineItem/KabineItem';
import RuftasteItem from '../RuftasteItem/RuftasteItem';
import AnzeigeItem from '../AnzeigeItem/AnzeigeItem';
import BedienpanelItem from '../Bedienpanel/BedienpanelItem';

const ObjekteBereich: React.FC = () => {
    return (
        <div className="objekte-bereich">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <EtageItem />
                <KabineItem />
                <BedienpanelItem />
                <RuftasteItem />
                <AnzeigeItem />
            </div>
        </div>
    );
};

export default ObjekteBereich;
