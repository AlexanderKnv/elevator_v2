import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import './AnzeigeZone.css';
import type { Kabine } from "../../../store/kabineSlice";

type AnzeigeZoneProps = {
    side: 'left' | 'right';
};

const AnzeigeZone: React.FC<AnzeigeZoneProps> = ({ side }) => {
    const etagenMitAnzeige = useSelector((s: RootState) => s.anzeige.etagenMitAnzeige);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find((k: Kabine) => k.side === side));
    const etagen = useSelector((state: RootState) => state.etage.etagen);

    if (etagen.length === 0 || etagenMitAnzeige.length === 0) return null;

    return (
        <div className="anzeige-zone">
            <div className={`anzeige-panel ${side}`}>
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
