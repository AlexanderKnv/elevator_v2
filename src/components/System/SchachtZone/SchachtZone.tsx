import './SchachtZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

type SchachtZoneProps = { etageNumber: number };

const SchachtZone: React.FC<SchachtZoneProps> = ({ etageNumber }) => {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const etagenSchacht = useSelector((state: RootState) => state.schacht.etagenMitSchacht);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen[0]);

    if (etagen.length === 0 || etagenSchacht.length === 0) return null;
    const hasSchacht = etagenSchacht.includes(etageNumber);
    if (!hasSchacht) return null;

    const doorsOpenHere = kabine && kabine.currentEtage === etageNumber && kabine.doorsOpen === true;

    return (
        <div className="elevator-zone">
            <div className="elevator-framing">
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