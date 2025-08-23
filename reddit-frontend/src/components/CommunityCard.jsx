import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const CommunityCard = ({ community }) => {
  return (
    <Card variant="outlined" className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar 
            src={community.imageUrl} 
            alt={community.name}
            className="h-12 w-12"
          >
            {community.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link to={`/r/${community.name}`} className="block">
              <Typography variant="h6" noWrap className="font-medium hover:underline">
                r/{community.name}
              </Typography>
            </Link>
            <Typography variant="body2" color="textSecondary" noWrap>
              {community.memberCount || 0} members
            </Typography>
          </div>
          <Button 
            variant="outlined" 
            size="small"
            component={Link}
            to={`/r/${community.name}`}
          >
            View
          </Button>
        </div>
        {community.description && (
          <Box mt={2}>
            <Typography variant="body2">
              {community.description.length > 200 
                ? `${community.description.substring(0, 200)}...` 
                : community.description}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityCard;
