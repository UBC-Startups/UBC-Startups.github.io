import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import HomePage from './pages/Home.jsx';
// import OpportunitiesPage from './pages/Opportunities.jsx';
import MeetOurTeam from './pages/MeetOurTeam.jsx';
import Events from './pages/Events.jsx';
import EventPoster from './pages/EventPoster.jsx';
import SOAR from "./pages/SOAR";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meetOurTeam" element={<MeetOurTeam />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event-poster/soar-2026" element={<SOAR />} />
          <Route path="/event-poster/:eventId" element={<EventPoster />} />
          {/* <Route path="/opportunities" element={<OpportunitiesPage />} /> */}
        </Routes>
      </Router>
    );
}

export default App;
