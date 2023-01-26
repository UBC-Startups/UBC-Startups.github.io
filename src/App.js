import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import HomePage from './pages/Home.jsx';
import OpportunitiesPage from './pages/Opportunities.jsx';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/opportunities" element={<OpportunitiesPage/>} />
          {/* <Route path="/opportunities" element={<OpportunitiesPage />} /> */}
        </Routes>
      </Router>
    );
}

export default App;
