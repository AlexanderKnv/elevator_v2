import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import './AnzeigeZone.css';

const AnzeigeZone: React.FC = () => {
    const etagenMitAnzeige = useSelector((s: RootState) => s.anzeige.etagenMitAnzeige);
    const kabine = useSelector((s: RootState) => s.kabine.kabinen[0]);
    const etagen = useSelector((state: RootState) => state.etage.etagen);

    if (etagen.length === 0 || etagenMitAnzeige.length === 0) return null;

    return (
        <div className="anzeige-zone">
            <div className="anzeige-panel">
                <div className="anzeige-floor">{kabine?.currentEtage ?? '-'}</div>
                <div className="anzeige-direction">
                    {kabine?.callQueue
                        ? kabine.directionMovement === 'up' ? '▲' : kabine.directionMovement === 'down' ? '▼' : ''
                        : ''}
                </div>
            </div>
        </div>
    );
};

export default AnzeigeZone;
