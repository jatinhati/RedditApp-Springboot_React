import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import Popular from './pages/Popular';
import All from './pages/All';
import Communities from './pages/Communities';
import CreateCustomFeed from './pages/CreateCustomFeed';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import CreateCommunity from './pages/CreateCommunity';
import PostDetail from './pages/PostDetail';
import CommunityPage from './pages/CommunityPage';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/popular" element={<Popular />} />
                  <Route path="/all" element={<All />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/create" element={<CreateCommunity />} />
                  <Route path="/create-community" element={<CreateCommunity />} />
                  <Route path="/create-custom-feed" element={<CreateCustomFeed />} />
                  <Route path="/submit" element={<CreatePost />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/r/:communityName" element={<CommunityPage />} />
                  <Route path="/search" element={<SearchResults />} />
                  {/* Placeholder routes for footer links */}
                  <Route path="/about" element={<div className="p-8 text-center">About Reddit - Coming Soon</div>} />
                  <Route path="/advertise" element={<div className="p-8 text-center">Advertise - Coming Soon</div>} />
                  <Route path="/help" element={<div className="p-8 text-center">Help - Coming Soon</div>} />
                  <Route path="/blog" element={<div className="p-8 text-center">Blog - Coming Soon</div>} />
                  <Route path="/careers" element={<div className="p-8 text-center">Careers - Coming Soon</div>} />
                  <Route path="/press" element={<div className="p-8 text-center">Press - Coming Soon</div>} />
                  <Route path="/terms" element={<div className="p-8 text-center">Terms - Coming Soon</div>} />
                  <Route path="/privacy" element={<div className="p-8 text-center">Privacy Policy - Coming Soon</div>} />
                  <Route path="/content-policy" element={<div className="p-8 text-center">Content Policy - Coming Soon</div>} />
                  <Route path="/user-agreement" element={<div className="p-8 text-center">User Agreement - Coming Soon</div>} />
                </Routes>
              </>
            } />
          </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;