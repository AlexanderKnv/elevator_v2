import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useEffect, useState } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { generateDeklarativEtagenCode } from './codegen/deklarativ/etagen';
import { generateImperativEtagenCode } from './codegen/imperativ/etagen';
import { generateOopEtagenCode } from './codegen/oop/etagen';
import './CodeEditor.css';

type CodeStyle = 'Deklarativ' | 'Imperativ' | 'OOP';

export default function CodeEditor() {
  const etagen = useSelector((state: RootState) => state.etage.etagen);
  const [style, setStyle] = useState<CodeStyle>('Deklarativ');

  const WELCOME_LINE =
    'print("Willkommen in der Aufzugssimulation – viel Spaß beim Lernen!")';

  const [code, setCode] = useState(WELCOME_LINE);

  useEffect(() => {
    let generated = '';
    switch (style) {
      case 'Deklarativ':
        generated = generateDeklarativEtagenCode(etagen);
        break;
      case 'Imperativ':
        generated = generateImperativEtagenCode(etagen);
        break;
      case 'OOP':
        generated = generateOopEtagenCode(etagen);
        break;
    }

    setCode(generated ? `${generated}` : WELCOME_LINE);
  }, [etagen, style]);

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
        onChange={(value) => setCode(value)}
        theme={oneDark}
      />
    </div>
  );
}
