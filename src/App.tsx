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
