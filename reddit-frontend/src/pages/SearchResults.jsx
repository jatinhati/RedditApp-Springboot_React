import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Tabs, Tab, Box, Typography, CircularProgress } from '@mui/material';
import CommunityCard from '../components/CommunityCard';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch posts
        const postsResponse = await axios.get(`/api/v1/posts/search?query=${encodeURIComponent(query)}`);
        setPosts(postsResponse.data.content || []);
        
        // Fetch communities
        const communitiesResponse = await axios.get(`/api/v1/communities/search?query=${encodeURIComponent(query)}`);
        setCommunities(communitiesResponse.data.content || []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Typography variant="h4" className="mb-6">
        Search results for "{query}"
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="search results tabs">
          <Tab label={`Posts (${posts.length})`} />
          <Tab label={`Communities (${communities.length})`} />
        </Tabs>
      </Box>

      <div className="space-y-4">
        {activeTab === 0 ? (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <Typography>No posts found matching your search.</Typography>
          )
        ) : communities.length > 0 ? (
          <div className="grid gap-4">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        ) : (
          <Typography>No communities found matching your search.</Typography>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
