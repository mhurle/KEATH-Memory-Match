// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import FormPage from './FormPage.jsx';
import Game from './Game.jsx';

function App() {
  return (
    <Routes>
      {/* Route #1: Show the form by default at "/" */}
      <Route path="/" element={<FormPage />} />

      {/* Route #2: The memory match game at "/game" */}
      <Route path="/game" element={<Game />} />

      {/* You can add more routes for Leaderboard, etc. */}
      {/* <Route path="/leaderboard" element={<LeaderboardPage />} /> */}
    </Routes>
  );
}

export default App;