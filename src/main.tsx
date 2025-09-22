/** @packageDocumentation
 * Haupteinstiegspunkt der Anwendung.
 * - Initialisiert die React-Root.
 * - Aktiviert zusätzliche Prüfungen im Entwicklungsmodus mit `<StrictMode>`.
 * - Stellt den globalen Zustand über `<Provider store={store}>` bereit (Redux Toolkit).
 * - Aktiviert Drag-and-Drop mit `<DndProvider backend={HTML5Backend}>`.
 * - Rendert die Hauptkomponente `<App />` in das DOM-Element mit der ID `root`.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux';
import { store } from './store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <DndProvider backend={HTML5Backend}>
                <App />
            </DndProvider>
        </Provider>,
    </StrictMode>,
)
