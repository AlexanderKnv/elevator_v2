import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useEffect, useMemo, useState } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import './CodeEditor.css';
import { generateCode, type CodeStyle } from './codegen/codegen';
import { resetEtagen } from '../../store/etageSlice';
import { debounce } from 'lodash';
import { resetKabinen } from '../../store/kabineSlice';
import { parseCode } from './codegen/parse';

export default function CodeEditor() {
  const etagen = useSelector((state: RootState) => state.etage.etagen);
  const kabinen = useSelector((state: RootState) => state.kabine.kabinen);
  const [style, setStyle] = useState<CodeStyle>('Deklarativ');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    setCode(generateCode(style, etagen, kabinen));
  }, [style, etagen, kabinen]);

  const handleCodeChange = useMemo(() => debounce((newCode: string) => {
    setCode(newCode);
    setErrorMessage(null);
    try {
    const { etagen: parsedEtagen, kabinen: parsedKabinen } = parseCode(style, newCode);

    if (parsedEtagen) dispatch(resetEtagen(parsedEtagen));
    if (parsedKabinen) dispatch(resetKabinen(parsedKabinen));
  } catch (err) {
    setErrorMessage("Fehler beim Parsen des Codes. Bitte Syntax überprüfen.");
  }
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
      {errorMessage && (
        <div style={{ color: 'red', marginTop: 8 }}>
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}
