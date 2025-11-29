import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import MainPage from './MainPage';
import HotZone from './HotZone';
import Settings from './Settings';
import ManualControl from './ManualControl';
import Tutorials from './Tutorials';
import About from './About';
import AIAgent from './AIAgent';
import ImportExport from './ImportExport';
import Motors from './Motors';
import AIBehavior from './AIBehavior';
import ComponentsDemo from './ComponentsDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="manual-control" element={<ManualControl />} />
          <Route path="ai-agent" element={<AIAgent />} />
          <Route path="settings" element={<Settings />}>
            <Route path="import-export" element={<ImportExport />} />
            <Route path="motors" element={<Motors />} />
            <Route path="ai-behavior" element={<AIBehavior />} />
            <Route path="hot-zone" element={<HotZone />} />
          </Route>
          <Route path="tutorials" element={<Tutorials />} />
          <Route path="components-demo" element={<ComponentsDemo />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
