import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const AuthSystem = ({ onAuthenticated }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Read users from local storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setNotification({ 
          open: true, 
          message: 'Successfully logged in!', 
          severity: 'success' 
        });
        onAuthenticated(user);
      } else {
        setNotification({ 
          open: true, 
          message: 'Invalid credentials', 
          severity: 'error' 
        });
      }
    } catch (error) {
      setNotification({ 
        open: true, 
        message: 'Login failed', 
        severity: 'error' 
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setNotification({ 
        open: true, 
        message: 'Passwords do not match', 
        severity: 'error' 
      });
      return;
    }

    if (selectedGenres.length === 0) {
      setNotification({ 
        open: true, 
        message: 'Please select at least one genre', 
        severity: 'error' 
      });
      return;
    }

    try {
      // Get existing users or initialize empty array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some(user => user.email === signupForm.email)) {
        setNotification({ 
          open: true, 
          message: 'Email already registered', 
          severity: 'error' 
        });
        return;
      }

      // Create new user
      const newUser = {
        ...signupForm,
        id: Date.now(),
        preferredGenres: selectedGenres
      };

      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      setNotification({ 
        open: true, 
        message: 'Account created successfully!', 
        severity: 'success' 
      });
      
      // Auto-login after signup
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      onAuthenticated(newUser);
      
    } catch (error) {
      setNotification({ 
        open: true, 
        message: 'Signup failed', 
        severity: 'error' 
      });
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 8, 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h4" textAlign="center" gutterBottom>
            📚 BookFinder
          </Typography>
          
          <Tabs 
            value={tab} 
            onChange={(_, newValue) => setTab(newValue)}
            centered 
            sx={{ mb: 4 }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {tab === 0 ? (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                sx={{ mt: 3 }}
              >
                Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                required
              />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Select Your Preferred Genres
              </Typography>
              
              <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleGenreSelect(category)}
                    color={selectedGenres.includes(category) ? "primary" : "default"}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                sx={{ mt: 2 }}
              >
                Sign Up
              </Button>
            </form>
          )}
        </Paper>
      </motion.div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AuthSystem;