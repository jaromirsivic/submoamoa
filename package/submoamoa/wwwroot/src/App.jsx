import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import MainPage from './MainPage';
import HotZone from './HotZone';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="hot-zone" element={<HotZone />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
