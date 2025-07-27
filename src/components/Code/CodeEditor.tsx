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
import { generateDeklarativKabinenCode } from './codegen/deklarativ/kabinen';
import { generateImperativKabinenCode } from './codegen/imperativ/kabinen';
import { generateOopKabinenCode } from './codegen/oop/kabinen';

type CodeStyle = 'Deklarativ' | 'Imperativ' | 'OOP';

export default function CodeEditor() {
  const etagen = useSelector((state: RootState) => state.etage.etagen);
  const kabinen = useSelector((state: RootState) => state.kabine.kabinen);
  const [style, setStyle] = useState<CodeStyle>('Deklarativ');

  const WELCOME_LINE =
    'print("Willkommen in der Aufzugssimulation – viel Spaß beim Lernen!")';

  const [code, setCode] = useState(WELCOME_LINE);

  useEffect(() => {
    let generatedEtagen = '';
    let generatedKabinen = '';

  switch (style) {
    case 'Deklarativ':
      generatedEtagen = generateDeklarativEtagenCode(etagen);
      generatedKabinen = generateDeklarativKabinenCode(kabinen);
      break;
    case 'Imperativ':
      generatedEtagen = generateImperativEtagenCode(etagen);
      generatedKabinen = generateImperativKabinenCode(kabinen);
      break;
    case 'OOP':
      generatedEtagen = generateOopEtagenCode(etagen);
      generatedKabinen = generateOopKabinenCode(kabinen);
      break;
  }

    const combinedCode = [generatedEtagen, generatedKabinen]
    .filter(Boolean)
    .join('\n\n');

    setCode(combinedCode ? `${combinedCode}` : WELCOME_LINE);
  }, [etagen, kabinen, style]);

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
