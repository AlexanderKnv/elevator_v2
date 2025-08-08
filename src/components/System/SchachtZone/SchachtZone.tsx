import './SchachtZone.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

const SchachtZone: React.FC = () => {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const etagenSchacht = useSelector(
        (state: RootState) => state.schacht.etagenMitSchacht
    );

    if (etagen.length === 0 || etagenSchacht.length === 0) return null;

    return (
        <div className="elevator-zone">
            <div className="elevator-framing">
                <div className="decorative-panel top-panel"></div>
                <div className="elevator-structure">
                    <div className="side-panel left-panel"></div>
                    <div className="elevator-doors">
                        <div className="door left-door"></div>
                        <div className="door right-door"></div>
                    </div>
                    <div className="side-panel right-panel"></div>
                </div>
            </div>
        </div>
    );
};

export default SchachtZone;