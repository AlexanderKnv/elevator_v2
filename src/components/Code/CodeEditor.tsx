import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useEffect, useMemo, useState } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import './CodeEditor.css';
import { generateCode, type CodeStyle } from './codegen/codegen';
import { resetEtagen } from '../../store/etageSlice';
import { parseDeklarativEtagenCode } from './codegen/deklarativ/parseEtagen';
import { debounce } from 'lodash';
import { parseImperativEtagenCode } from './codegen/imperativ/parseEtagen';
import { parseOopEtagenCode } from './codegen/oop/parseEtagen';
import { resetKabinen, type Kabine } from '../../store/kabineSlice';
import { parseDeklarativKabinenCode } from './codegen/deklarativ/parseKabinen';
import { parseImperativKabinenCode } from './codegen/imperativ/parseKabinen';
import { parseOopKabinenCode } from './codegen/oop/parseKabinen';

export default function CodeEditor() {
  const etagen = useSelector((state: RootState) => state.etage.etagen);
  const kabinen = useSelector((state: RootState) => state.kabine.kabinen);
  const [style, setStyle] = useState<CodeStyle>('Deklarativ');
  const [code, setCode] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    setCode(generateCode(style, etagen, kabinen));
  }, [style, etagen, kabinen]);

  const handleCodeChange = useMemo(() => debounce((newCode: string) => {
    setCode(newCode);

    let parsedEtagen: number[] = [];
    let parsedKabinen: Kabine[] = [];

    switch (style) {
      case 'Deklarativ':
        parsedEtagen = parseDeklarativEtagenCode(newCode);
        parsedKabinen = parseDeklarativKabinenCode(newCode);
        break;
      case 'Imperativ':
        parsedEtagen = parseImperativEtagenCode(newCode);
        parsedKabinen = parseImperativKabinenCode(newCode);
        break;
      case 'OOP':
        parsedEtagen = parseOopEtagenCode(newCode);
        parsedKabinen = parseOopKabinenCode(newCode);
        break;
    }

    if (parsedEtagen.length > 0 || etagen.length > 0)
      dispatch(resetEtagen(parsedEtagen));

    if (parsedKabinen.length > 0 || kabinen.length > 0)
      dispatch(resetKabinen(parsedKabinen));
  }, 3000), [style, etagen, kabinen]);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 4,  width: '100%', marginRight: "20px" }}>

      <div className="select" style={{  display: 'flex', justifyContent: 'flex-end'}}>
        <label style={{ marginRight: '10px'}}>Programmierstil: </label>
        <select style={{ fontFamily: 'monospace'}}
          className="select-dark"
          value={style}
          onChange={(e) => setStyle(e.target.value as CodeStyle)}
        >
          <option className="option-select" value="Deklarativ">Deklarativ</option>
          <option className="option-select" value="Imperativ">Imperativ</option>
          <option className="option-select" value="OOP">Objektorientiert</option>
        </select>
      </div>

      <CodeMirror
        value={code}
        height="100%"
        extensions={[python()]}
        onChange={(value) => handleCodeChange(value)}
        theme={oneDark}
      />
    </div>
  );
}
