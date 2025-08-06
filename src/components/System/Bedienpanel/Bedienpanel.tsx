import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { addCallToQueue, addZielEtage, openDoors, } from '../../../store/kabineSlice';
import Icon from '../../../assets/icon-elevator.png';
import './Bedienpanel.css';

const Bedienpanel: React.FC = () => {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);
    const dispatch = useDispatch();

    const zielEtagen = kabine?.aktiveZielEtagen || [];

    if (!kabine || !kabine.hasBedienpanel) return null;

    const handleEtageClick = (etage: number) => {
        if (!kabine) return;
        if (etage === kabine.currentEtage) return;
        if (zielEtagen.includes(etage)) return;
        dispatch(addCallToQueue(etage));
        dispatch(addZielEtage(etage));
    };

    const handleDoorToggle = () => {
        dispatch(openDoors());
    };

    return (
        <div className="bedienpanel">
            {[...etagen].reverse().map((etage) => (
                <button
                    key={etage}
                    onClick={() => handleEtageClick(etage)}
                    className={zielEtagen.includes(etage) ? 'bedienpanel-button active' : 'bedienpanel-button'}
                >
                    {etage}
                </button>
            ))}
            <button onClick={handleDoorToggle} className="bedienpanel-button door-toggle">
                <img src={Icon} alt="Icon-elevator" className="elevator-icon" />
            </button>
        </div>
    );
};

export default Bedienpanel;

