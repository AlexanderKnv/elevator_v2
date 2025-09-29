/** @packageDocumentation
 * # Bedienpanel (`Bedienpanel.tsx`)
 *
 * - Rendert Etagenknöpfe in absteigender Reihenfolge.
 * - Ignoriert Klicks auf die aktuelle Etage und bereits aktive Ziele.
 * - Fügt bei gültigem Klick einen Ruf zur Queue hinzu und markiert die Ziel-Etage.
 * - Rendert nur, wenn die zugehörige Kabine existiert und ein Bedienpanel besitzt.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store/store';
import { addCallToQueue, addZielEtage, } from '../../../store/kabineSlice';
import './Bedienpanel.css';

type BedienpanelProps = {
    side: 'left' | 'right';
};

const Bedienpanel: React.FC<BedienpanelProps> = ({ side }) => {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const kabine = useSelector((state: RootState) =>
        state.kabine.kabinen.find(k => k.side === side)
    );
    const dispatch = useDispatch();

    const zielEtagen = kabine?.aktiveZielEtagen || [];

    if (!kabine || !kabine.hasBedienpanel) return null;

    const handleEtageClick = (etage: number) => {
        if (!kabine) return;
        if (etage === kabine.currentEtage) return;
        if (zielEtagen.includes(etage)) return;
        dispatch(addCallToQueue({ side, etage }));
        dispatch(addZielEtage({ side, etage }));
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
        </div>
    );
};

export default Bedienpanel;
