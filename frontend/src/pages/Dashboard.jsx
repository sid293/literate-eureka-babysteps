import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { milestones as milestonesApi, tips as tipsApi } from '../services/api';

const Dashboard = () => {
  const [milestones, setMilestones] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    notes: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [milestoneTips, setMilestoneTips] = useState({});

  const fetchMilestones = async () => {
    try {
      const { data } = await milestonesApi.getAll();
      setMilestones(data);
    } catch (err) {
      console.error('Error fetching milestones:', err);
    }
  };

  const fetchAllTips = async (milestonesList) => {
    const tipsObj = {};
    for (const m of milestonesList) {
      try {
        const { data } = await tipsApi.getForMilestone(m._id);
        tipsObj[m._id] = data;
      } catch {
        tipsObj[m._id] = [];
      }
    }
    setMilestoneTips(tipsObj);
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  useEffect(() => {
    if (milestones.length > 0) {
      fetchAllTips(milestones);
    }
  }, [milestones]);

  const handleOpenDialog = (milestone = null) => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        date: milestone.date.split('T')[0],
        notes: milestone.notes || '',
      });
      setSelectedMilestone(milestone);
    } else {
      setFormData({ title: '', date: '', notes: '' });
      setSelectedMilestone(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ title: '', date: '', notes: '' });
    setSelectedMilestone(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMilestone) {
        await milestonesApi.update(selectedMilestone._id, formData);
      } else {
        await milestonesApi.create(formData);
      }
      fetchMilestones();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving milestone:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await milestonesApi.delete(id);
      fetchMilestones();
    } catch (err) {
      console.error('Error deleting milestone:', err);
    }
  };

  const handleAddTip = async (milestoneId) => {
    try {
      await tipsApi.create(milestoneId, newTip);
      setNewTip('');
      fetchAllTips(milestones);
    } catch (err) {
      console.error('Error adding tip:', err);
    }
  };

  const handleDeleteTip = async (tipId) => {
    try {
      await tipsApi.delete(tipId);
      fetchAllTips(milestones);
    } catch (err) {
      console.error('Error deleting tip:', err);
    }
  };

  const handleNext = async () => {
    if (currentMilestoneIndex < milestones.length) {
      const milestone = milestones[currentMilestoneIndex];
      if (milestone.status !== 'completed') {
        await milestonesApi.update(milestone._id, { ...milestone, status: 'completed' });
        fetchMilestones();
      }
      setCurrentMilestoneIndex((prev) => Math.min(prev + 1, milestones.length - 1));
    }
  };

  const handlePrevious = async () => {
    if (currentMilestoneIndex > 0) {
      const milestone = milestones[currentMilestoneIndex - 1];
      if (milestone.status === 'completed') {
        await milestonesApi.update(milestone._id, { ...milestone, status: 'pending' });
        fetchMilestones();
      }
      setCurrentMilestoneIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const currentMilestone = milestones[currentMilestoneIndex];

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
          My Milestones
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/users')}
            sx={{ 
              mr: 2,
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
            View Users
          </Button>
          <Button
            variant="outlined"
            onClick={logout}
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
            Logout
          </Button>
        </Box>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ 
          mb: 4,
          color: '#fff',
          backgroundColor: '#1976d2',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        Add Milestone
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mb: 2, overflowX: 'auto', justifyContent: 'center' }}>
        {milestones.map((milestone, idx) => {
          let bgColor = '#fff';
          if (milestone.status === 'completed') bgColor = '#e3f2fd';
          else if (milestone.status === 'in-progress') bgColor = '#fffde7';
          else if (milestone.status === 'pending') bgColor = '#fff';
          const tips = milestoneTips[milestone._id] || [];
          return (
            <Card
              key={milestone._id}
              sx={{
                minWidth: 250,
                backgroundColor: bgColor,
                border: idx === currentMilestoneIndex ? '3px solid #1976d2' : `2px solid ${milestone.status === 'completed' ? '#1976d2' : '#e0e0e0'}`,
                color: '#222',
                boxShadow: idx === currentMilestoneIndex ? '0 0 10px #1976d2' : undefined,
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#1976d2', mb: 1 }}>
                    Tips for this milestone:
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                    {tips.length === 0 ? (
                      <Typography variant="body2" sx={{ color: '#888' }}>No tips yet.</Typography>
                    ) : (
                      tips.map((tip) => (
                        <Paper key={tip._id} sx={{ p: 1, mb: 1, background: '#e3f2fd', color: '#222' }}>
                          <Typography variant="body2">{tip.tip}</Typography>
                          <Typography variant="caption">By {tip.user.username}</Typography>
                        </Paper>
                      ))
                    )}
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton 
                  onClick={() => handleOpenDialog(milestone)}
                  sx={{ color: '#1976d2' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(milestone._id)}
                  sx={{ color: '#1976d2' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentMilestoneIndex === 0}
          sx={{ background: '#00bb00', color: '#fff', '&:hover': { background: '#00ff00', color: '#222' } }}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentMilestoneIndex === milestones.length - 1}
          sx={{ background: '#00bb00', color: '#fff', '&:hover': { background: '#00ff00', color: '#222' } }}
        >
          Next
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}>
          {selectedMilestone ? 'Edit Milestone' : 'Add Milestone'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#fff' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#1976d2' },
                  '&:hover fieldset': { borderColor: '#1976d2' },
                },
                '& .MuiInputLabel-root': { color: '#1976d2' },
                '& .MuiInputBase-input': { color: '#1976d2' },
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#1976d2' },
                  '&:hover fieldset': { borderColor: '#1976d2' },
                },
                '& .MuiInputLabel-root': { color: '#1976d2' },
                '& .MuiInputBase-input': { color: '#1976d2' },
              }}
            />
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={4}
              margin="normal"
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
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ color: '#1976d2', borderColor: '#1976d2', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', color: '#fff', fontWeight: 600 }}
          >
            {selectedMilestone ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 