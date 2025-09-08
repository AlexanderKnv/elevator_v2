import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import './AnzeigeZone.css';
import type { Kabine } from "../../../store/kabineSlice";
import { removeAnzeigeFromEtage } from "../../../store/anzeigeSlice ";

type AnzeigeZoneProps = {
    side: 'left' | 'right';
    etageNumber: number;
};

const AnzeigeZone: React.FC<AnzeigeZoneProps> = ({ side, etageNumber }) => {
    const etagenMitAnzeige = useSelector((s: RootState) => s.anzeige.etagenMitAnzeige);
    const kabine = useSelector((state: RootState) => state.kabine.kabinen.find((k: Kabine) => k.side === side));
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const dispatch = useDispatch<AppDispatch>();

    if (etagen.length === 0 || etagenMitAnzeige.length === 0) return null;

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(removeAnzeigeFromEtage({ etage: etageNumber, side }));
    };

    return (
        <div className="anzeige-zone">
            <div className={`anzeige-panel ${side}`}>
                <button
                    className="anzeige-remove"
                    onClick={handleRemove}
                >
                    ×
                </button>
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
