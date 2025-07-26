import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useState } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
export default function CodeEditor() {
  const [code, setCode] = useState('print("Hello, world!")');

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 4,  width: '100%', marginRight: "20px" }}>
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
