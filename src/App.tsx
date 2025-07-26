import './App.css'
import CodeEditor from './components/Code/CodeEditor';
import { ObjekteBereich } from './components/Objekte';
import { SystemBereich } from './components/System';

function App() {
  return (
    <div className="app">
      <div className="left-pane">
        <ObjekteBereich/>
        <div className="code-bereich">
          <CodeEditor />
        </div>
      </div>
      <SystemBereich/>
    </div>
  );
}

export default App;
