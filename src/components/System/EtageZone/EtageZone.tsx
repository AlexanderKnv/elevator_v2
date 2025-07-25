import './EtageZone.css';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { addEtage } from '../../../store/etageSlice';

const MAX_ETAGEN = 3;

const EtageZone: React.FC = () => {
  const dispatch = useDispatch();
  const etagen = useSelector((state: RootState) => state.etage.etagen);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'ETAGE',
    drop: () => {
      dispatch(addEtage());
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return dropRef (
    <div className="etagen-container">
      {[...etagen].reverse().map((nr) => (
        <div key={nr} className="etage-visual">
          <div className="etageCircle">{nr}</div>
        </div>
      ))}
      {isOver && etagen.length < MAX_ETAGEN && (
        <div className="overlay" style={{ top: `${(3 - etagen.length - 1) * 33.33}%` }}>
          + Etage
        </div>
      )}
    </div>
  );
};

export default EtageZone;
