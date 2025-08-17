import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useEffect, useState } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import './CodeEditor.css';
import { generateCode, type CodeStyle } from './codegen/codegen';
import { resetEtagen } from '../../store/etageSlice';
import { resetKabinen } from '../../store/kabineSlice';
import { parseCode } from './codegen/parse';
import { resetRuftasten } from '../../store/ruftasteSlice';
import { resetAnzeige } from '../../store/anzeigeSlice ';

export default function CodeEditor() {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const kabinen = useSelector((state: RootState) => state.kabine.kabinen);
    const ruftasten = useSelector((state: RootState) => state.ruftaste);
    const anzeigeEtagen = useSelector((state: RootState) => state.anzeige.etagenMitAnzeige);
    const [style, setStyle] = useState<CodeStyle>('Imperativ');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        setCode(generateCode(style, etagen, kabinen, ruftasten, anzeigeEtagen));
    }, [style, etagen, kabinen, ruftasten, anzeigeEtagen]);

    const handleRun = () => {
        setErrorMessage(null);
        try {
            const {
                etagen: parsedEtagen,
                kabinen: parsedKabinen,
                ruftasten: parsedRuftasten,
                anzeige: parsedAnzeige,
            } = parseCode(style, code);

            dispatch(resetEtagen(parsedEtagen));
            dispatch(resetKabinen(parsedKabinen));
            dispatch(resetRuftasten(parsedRuftasten));
            dispatch(resetAnzeige(parsedAnzeige.etagenMitAnzeige));
        } catch (err) {
            //@ts-ignore
            setErrorMessage(err.message);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: 4, width: '100%' }}>
            <div className="header">
                <button onClick={handleRun} className="run-button">
                    ▶ Run
                </button>
                <div className="select" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ marginRight: '10px' }}>Programmierstil: </label>
                    <select style={{ fontFamily: 'monospace' }}
                        className="select-dark"
                        value={style}
                        onChange={(e) => setStyle(e.target.value as CodeStyle)}
                    >
                        <option className="option-select" value="Imperativ">Imperativ</option>
                        <option className="option-select" value="Deklarativ">Deklarativ</option>
                        <option className="option-select" value="OOP">Objektorientiert</option>
                    </select>
                </div>
            </div>

            <CodeMirror
                value={code}
                height="100%"
                extensions={[python()]}
                onChange={(value) => setCode(value)}
                theme={oneDark}
                style={{ overflow: 'auto' }}
            />

            {errorMessage && (
                <div style={{ color: 'red', marginTop: 8 }}>
                    ⚠️ {errorMessage}
                </div>
            )}
        </div>
    );
}
