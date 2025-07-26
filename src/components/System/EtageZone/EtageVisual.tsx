import React from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { addKabine  } from '../../../store/kabineSlice';


interface EtageVisualProps {
  etageNumber: number;
}

const EtageVisual: React.FC<EtageVisualProps> = ({ etageNumber }) => {
  const dispatch = useDispatch();

  const [{ isOver }, dropRefKabine] = useDrop(() => ({
    accept: 'KABINE',
    drop: () => dispatch(addKabine({ etage: 1 })),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    //@ts-ignore
    <div ref={dropRefKabine} className="etage-visual" style={{ position: 'relative' }}>
      <div className="etageCircle">{etageNumber}</div>
      <div className="inner-zone">
        {isOver && (
          <div
            className="overlay-kabine"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              zIndex: 1,
            }}
          >
            + Кабина
          </div>
        )}
      </div>
    </div>
  );
};

export default EtageVisual;
