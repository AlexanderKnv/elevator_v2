import './SchachtZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import type { Kabine } from '../../../store/kabineSlice';

type SchachtZoneProps = {
    etageNumber: number;
    side: 'left' | 'right';
};

const SchachtZone: React.FC<SchachtZoneProps> = ({ etageNumber, side }) => {

    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find((k: Kabine) => k.side === side));

    const doorsOpenHere = kabine && kabine.currentEtage === etageNumber && kabine.doorsOpen === true;

    return (
        <div className="elevator-zone">
            <div className={`elevator-framing ${side}`}>
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