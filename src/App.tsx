/** @packageDocumentation
 * Oberste UI-Komponente der Anwendung.
 * - Orchestriert die Hauptbereiche: `<ObjekteBereich>`, `<SystemBereich>` und `<CodeEditor>`.
 * - Stellt das Grundlayout bereit und kapselt globale Stile.
 */

import './App.css'
import CodeEditor from './components/Code/CodeEditor';
import { ObjekteBereich } from './components/Objekte';
import { SystemBereich } from './components/System';

function App() {
    return (
        <div className="app">
            <ObjekteBereich />
            <SystemBereich />
            <div className="code-bereich">
                <CodeEditor />
            </div>
        </div>
    );
}

export default App;
