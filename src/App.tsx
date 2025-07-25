import './App.css'
import { ObjekteBereich } from './components/Objekte';
import { SystemBereich } from './components/System';

function App() {
  return (
    <div className="app">
      <div className="left-pane">
        <ObjekteBereich/>
        <div className="code-bereich">Code-Bereich</div>
      </div>
      <SystemBereich/>
    </div>
  );
}

export default App;
