import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Rankings from './pages/Rankings';
import Download from './pages/Download';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ServerInfo from './pages/ServerInfo';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import CharacterOverview from './components/CharacterOverview';
import GuildOverview from './components/GuildOverview';
import { AuthProvider } from './context/AuthContext';
import './styles/sro-items.css';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from './routes/ProtectedRoute';
import NewsSection from './components/NewsSection';
import ServerRules from './components/Legal/Server Rules';
import ConfirmAccountDeletion from './pages/ConfirmAccountDeletion';
import Guide from './pages/Guide';
import BeginnerGuide from './pages/BeginnerGuide';
import ServerGuide from './pages/ServerGuide';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {' '}
          <Route path='/' element={<Index />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route path='/verify-email/:token' element={<VerifyEmail />} />
          <Route path='/confirm-account-deletion/:token' element={<ConfirmAccountDeletion />} />
          <Route path='/resend-verification' element={<ResendVerification />} />
          <Route path='/rankings' element={<Rankings />} />
          <Route path='/download' element={<Download />} />
          <Route path='/news' element={<News />} />
          <Route path='/news/:slug' element={<NewsDetail />} />
          <Route path='/server-info' element={<ServerInfo />} />
          <Route path='/rules' element={<ServerRules />} />
          <Route path='/guide' element={<Guide />} />
          <Route path='/guide/beginner' element={<BeginnerGuide />} />
          <Route path='/guide/server' element={<ServerGuide />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/account' element={<Account />} />
            <Route path='/AdminDashboard' element={<AdminDashboard />} />
            <Route path='/character/:characterName' element={<CharacterOverview />} />
            <Route path='/guild/:guildName' element={<GuildOverview />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
