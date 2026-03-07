import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
// We will import Pages here as we build them
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Feed from './pages/Feed';
import Help from './pages/Help';
import AddBlog from './pages/AddBlog';
import BlogView from './pages/BlogView';
import Profile from './pages/Profile';
import Discussion from './pages/Discussion';
import Shorts from './pages/Shorts';

function App() {
  return (
    <Router>
      <div className="bg-light min-vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/help" element={<Help />} />
          <Route path="/add-blog" element={<AddBlog />} />
          <Route path="/blog/:id" element={<BlogView />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/shorts" element={<Shorts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
