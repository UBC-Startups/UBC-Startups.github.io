import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import HomePage from './pages/Home.jsx';
// import OpportunitiesPage from './pages/Opportunities.jsx';
import MeetOurTeam from './pages/MeetOurTeam.jsx';
import Events from './pages/Events.jsx';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meetOurTeam" element={<MeetOurTeam />} />
          <Route path="/events" element={<Events />} />
          {/* <Route path="/opportunities" element={<OpportunitiesPage />} /> */}
        </Routes>
      </Router>
    );
}

export default App;
