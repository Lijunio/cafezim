import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import TodayMeetup from './pages/TodayMeetup';
import History from './pages/History';
import MeetupDetail from './pages/MeetupDetail';
import Timeline from './pages/Timeline';
import InvitePage from './pages/InvitePage';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/today" element={<TodayMeetup />} />
          <Route path="/history" element={<History />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/meetup/:id" element={<MeetupDetail />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friend/:id" element={<FriendProfile />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
