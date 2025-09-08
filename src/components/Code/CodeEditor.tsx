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
import { resetSchacht } from '../../store/schachtSlice';
import pasteIcon from "../../assets/icons-paste.png";
import copyIcon from "../../assets/icons-copy.png";
import cutIcon from "../../assets/icons-cut.png";
import deleteIcon from "../../assets/icons-delete.png";

export default function CodeEditor() {
    const etagen = useSelector((state: RootState) => state.etage.etagen);
    const kabinen = useSelector((state: RootState) => state.kabine.kabinen);
    const ruftasten = useSelector((state: RootState) => state.ruftaste);
    const anzeige = useSelector((s: RootState) => s.anzeige);
    const schacht = useSelector((s: RootState) => s.schacht);
    const [style, setStyle] = useState<CodeStyle>('Imperativ');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        setCode(generateCode(style, etagen, kabinen, ruftasten, anzeige, schacht));
    }, [style, etagen, kabinen, ruftasten, anzeige, schacht]);

    const handleRun = () => {
        setErrorMessage(null);
        try {
            const {
                etagen: parsedEtagen,
                kabinen: parsedKabinen,
                ruftasten: parsedRuftasten,
                anzeige: parsedAnzeige,
                schacht: parsedSchacht,
            } = parseCode(style, code);

            dispatch(resetEtagen(parsedEtagen));
            dispatch(resetKabinen(parsedKabinen));
            dispatch(resetRuftasten(parsedRuftasten));
            dispatch(resetAnzeige(parsedAnzeige));
            dispatch(resetSchacht(parsedSchacht));
        } catch (err) {
            //@ts-ignore
            setErrorMessage(err.message);
        }
    };

    const handleDelete = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            range.deleteContents();
        }
    };

    const handleCopy = async () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const text = selection.toString();
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                console.error("Copy error:", err);
            }
        }
    };

    const handleCut = async () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const text = selection.toString();
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                selection.deleteFromDocument();
            } catch (err) {
                console.error("Cut error:", err);
            }
        }
    };

    const handlePaste = async () => {
        if (!window.isSecureContext || !navigator.clipboard?.readText) {
            return;
        }

        const text = await navigator.clipboard.readText();
        if (!text) return;

        const active = document.activeElement as Element | null;

        if (
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement
        ) {
            const start = active.selectionStart ?? active.value.length;
            const end = active.selectionEnd ?? active.value.length;

            active.setRangeText(text, start, end, "end");
            active.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

        if (active instanceof HTMLElement && active.isContentEditable) {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: 4, width: '100%' }}>
            <div className="header">
                <button onClick={handleRun} className="run-button">
                    ▶ Run
                </button>
                <div className='btn-container'>
                    <button
                        className='icon-btn'
                        title="Paste"
                        onClick={handlePaste} onMouseDown={(e) => e.preventDefault()}>
                        <img src={pasteIcon} alt="Paste" />
                    </button>
                    <button className='icon-btn' title="Copy" onClick={handleCopy}>
                        <img src={copyIcon} alt="Copy" />
                    </button>
                    <button className='icon-btn' title="Cut" onClick={handleCut}>
                        <img src={cutIcon} alt="Cut" />
                    </button>
                    <button className='icon-btn' title="Delete" onClick={handleDelete}>
                        <img src={deleteIcon} alt="Delete" />
                    </button>
                </div>
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
