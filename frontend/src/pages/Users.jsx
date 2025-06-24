import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { milestones as milestonesApi, tips as tipsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openTipsDialog, setOpenTipsDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await milestonesApi.getAllPublic();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchTips = async (milestoneId) => {
    try {
      const { data } = await tipsApi.getForMilestone(milestoneId);
      setTips(data);
    } catch (err) {
      console.error('Error fetching tips:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenTipsDialog = (milestone) => {
    setSelectedMilestone(milestone);
    fetchTips(milestone._id);
    setOpenTipsDialog(true);
  };

  const handleCloseTipsDialog = () => {
    setOpenTipsDialog(false);
    setSelectedMilestone(null);
    setNewTip('');
  };

  const handleAddTip = async () => {
    try {
      await tipsApi.create(selectedMilestone._id, newTip);
      setNewTip('');
      fetchTips(selectedMilestone._id);
    } catch (err) {
      console.error('Error adding tip:', err);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Community Milestones
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{ 
            color: '#1976d2',
            borderColor: '#1976d2',
            backgroundColor: '#fff',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Grid container spacing={4}>
        {users
          .filter((user) => !currentUser || user._id !== currentUser.id) // Hide current user
          .map((user) => (
            <Grid item xs={12} key={user._id}>
              <Typography variant="h6" sx={{ color: '#00ff00', mb: 2 }}>
                {user.username}'s Milestones
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, overflowX: 'auto' }}>
                {user.milestones.map((milestone) => {
                  let bgColor = '#fff';
                  if (milestone.status === 'completed') bgColor = '#e3f2fd'; // light blue
                  else if (milestone.status === 'in-progress') bgColor = '#fffde7'; // light yellow
                  else if (milestone.status === 'pending') bgColor = '#fff'; // white
                  return (
                    <Card 
                      key={milestone._id}
                      sx={{ 
                        minWidth: 250,
                        backgroundColor: bgColor,
                        border: `2px solid ${milestone.status === 'completed' ? '#1976d2' : '#e0e0e0'}`,
                        color: '#222',
                        mr: 2
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#222', mb: 1 }}>
                          {new Date(milestone.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#222', mb: 2 }}>
                          {milestone.notes}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenTipsDialog(milestone)}
                          sx={{ 
                            color: '#1976d2',
                            borderColor: '#1976d2',
                            '&:hover': {
                              borderColor: '#1976d2',
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                          }}
                        >
                          View & Add Tips
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
              <Divider sx={{ my: 4, borderColor: '#1976d2' }} />
            </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openTipsDialog} 
        onClose={handleCloseTipsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}>
          Tips for {selectedMilestone?.title}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#fff' }}>
          <List>
            {tips.map((tip) => (
              <ListItem key={tip._id}>
                <ListItemText 
                  primary={tip.tip}
                  secondary={`By ${tip.user.username}`}
                  sx={{
                    '& .MuiListItemText-primary': { color: '#1976d2' },
                    '& .MuiListItemText-secondary': { color: '#555' },
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Add a tip"
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#1976d2' },
                  '&:hover fieldset': { borderColor: '#1976d2' },
                },
                '& .MuiInputLabel-root': { color: '#1976d2' },
                '& .MuiInputBase-input': { color: '#1976d2' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f7fafd' }}>
          <Button 
            onClick={handleCloseTipsDialog}
            variant="outlined"
            sx={{ color: '#1976d2', borderColor: '#1976d2', fontWeight: 500 }}
          >
            Close
          </Button>
          <Button 
            onClick={handleAddTip}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', color: '#fff', fontWeight: 600 }}
          >
            Add Tip
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users; 