import './EtageZone.css';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { addEtage } from '../../../store/etageSlice';
import EtageVisual from './EtageVisual';

const MAX_ETAGEN = 3;

const EtageZone: React.FC = () => {
    const dispatch = useDispatch();
    const etagen = useSelector((state: RootState) => state.etage.etagen);

    const [{ isOver: isOverEtage }, dropRefEtage] = useDrop(() => ({
        accept: 'ETAGE',
        drop: () => {
            if (etagen.length < MAX_ETAGEN) {
                dispatch(addEtage());
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        //@ts-ignore
        <div ref={dropRefEtage} className="etagen-container" style={{ position: 'relative' }}>
            {[...etagen].reverse().map((nr) => (
                <EtageVisual key={nr} etageNumber={nr} />
            ))}

            {isOverEtage && etagen.length < MAX_ETAGEN && (
                <div
                    className="overlay-etage"
                    style={{
                        position: 'absolute',
                        top: `${(3 - etagen.length - 1) * 33.33}%`,
                        left: 0,
                        right: 0,
                        height: '33.33%',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#000',
                    }}
                >
                    + Etage
                </div>
            )}
        </div>
    );
};

export default EtageZone;