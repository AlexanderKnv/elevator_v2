import './SchachtZone.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import type { Kabine } from '../../../store/kabineSlice';
import { removeSchachtFromEtage } from '../../../store/schachtSlice';

type SchachtZoneProps = {
    etageNumber: number;
    side: 'left' | 'right';
};

const SchachtZone: React.FC<SchachtZoneProps> = ({ etageNumber, side }) => {
    const dispatch = useDispatch<AppDispatch>();

    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find((k: Kabine) => k.side === side));

    const doorsOpenHere = kabine && kabine.currentEtage === etageNumber && kabine.doorsOpen === true;

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(removeSchachtFromEtage({ etage: etageNumber, side }));
    };

    return (
        <div className="elevator-zone">
            <div className={`elevator-framing ${side}`}>
                <button
                    className="schacht-remove"
                    onClick={handleRemove}
                >
                    ×
                </button>
                <div className="decorative-panel top-panel"></div>
                <div className="elevator-structure">
                    <div className="side-panel left-panel"></div>
                    <div className="elevator-doors">
                        <div className={`door left-door ${doorsOpenHere ? 'open' : ''}`}></div>
                        <div className={`door right-door ${doorsOpenHere ? 'open' : ''}`}></div>
                    </div>
                    <div className="side-panel right-panel"></div>
                </div>
            </div>
        </div>
    );
};

export default SchachtZone;