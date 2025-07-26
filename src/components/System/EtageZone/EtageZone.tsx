import './EtageZone.css';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { addEtage } from '../../../store/etageSlice';
import { addKabine  } from '../../../store/kabineSlice';
const MAX_ETAGEN = 3;
//@ts-ignore
const EtageZone: React.FC = () => {
  const dispatch = useDispatch();
  const etagen = useSelector((state: RootState) => state.etage.etagen);
  // const kabinen = useSelector((state: RootState) => state.kabine.kabinen);


  const [{ isOver: isOver1 }, dropRef] = useDrop(() => ({
    accept: 'ETAGE',
    drop: () => {
      dispatch(addEtage());
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

    const [{  }, dropRefd] = useDrop(() => ({
    accept: 'KABINE',
    // canDrop: () => etagen.length > 0 && kabinen.length < 1,
    drop: () => {
      dispatch(addKabine({ etage: 1 })); // Всегда добавляем на первый этаж
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    //@ts-ignore
    <div ref={dropRef} className="etagen-container">

      {[...etagen].reverse().map((nr) => (
    //@ts-ignore

        <div key={nr} ref={dropRefd} className="etage-visual">
          <div className="etageCircle">{nr}</div>
          <div className="inner-zone">
      </div>
        </div>
      ))}
      
      {isOver1 && etagen.length < MAX_ETAGEN && (
        <div className="overlay" style={{ top: `${(3 - etagen.length - 1) * 33.33}%` }}>
          + Etage
        </div>
      )}
    </div>
  );
};

export default EtageZone;


// console.log('Текущий массив:', JSON.parse(JSON.stringify(state.etagen)));