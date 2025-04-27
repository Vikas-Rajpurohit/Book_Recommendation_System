import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Rating,
  Button,
  Skeleton,
  useTheme,
  DialogTitle,
  Divider,
  Paper,
} from '@mui/material';
import { 
  Close as CloseIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BookDetailModal = ({ book, open, onClose }) => {
  const theme = useTheme();
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchSimilarBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/similar_books/${book.isbn13}`);
      setSimilarBooks(response.data);
    } catch (error) {
      console.error('Error fetching similar books', error);
      setSimilarBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && book) {
      fetchSimilarBooks();
    }
  }, [open, book]);

  if (!book) return null;

  const handleShare = () => {
    // Implement share functionality
    console.log('Share book:', book.title);
  };

  const SimilarBookCard = ({ similarBook }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={similarBook.thumbnail || 'placeholder.jpg'}
          alt={similarBook.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap fontWeight="medium">
            {similarBook.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {similarBook.authors}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <Rating value={similarBook.average_rating} readOnly size="small" />
            <Typography variant="caption" color="text.secondary" ml={1}>
              ({similarBook.average_rating})
            </Typography>
          </Box>
        </CardContent>
      </Paper>
    </motion.div>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.default',
        }
      }}
    >
      <DialogTitle sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {book.title}
        </Typography>
        <Box>
          <IconButton onClick={() => setSaved(!saved)} sx={{ mr: 1 }}>
            {saved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={handleShare} sx={{ mr: 1 }}>
            <ShareIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" gap={4} mb={4}>
          {/* Book Cover and Details */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ 
              minWidth: 300,
              position: 'relative',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <img 
                src={book.thumbnail || 'placeholder.jpg'} 
                alt={book.title} 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Paper>
          </Box>

          {/* Book Information */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ flex: 1 }}
          >
            <Typography variant="h6" gutterBottom>
              by {book.authors}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={book.average_rating} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                {book.average_rating} average rating
              </Typography>
            </Box>

            <Box display="flex" gap={1} mb={3} flexWrap="wrap">
              <Chip label={`Published ${book.published_year}`} variant="outlined" />
              <Chip label={book.category} color="primary" variant="outlined" />
              <Chip label={`ISBN: ${book.isbn13}`} variant="outlined" />
            </Box>

            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {book.description}
            </Typography>
          </Box>
        </Box>

        {/* Similar Books Section */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Similar Books You Might Enjoy
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ position: 'relative' }}>
            <AnimatePresence>
              {loading ? (
                <Box display="flex" gap={2}>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ width: 200 }}>
                      <Skeleton variant="rectangular" height={200} />
                      <Skeleton variant="text" sx={{ mt: 1 }} />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  display="flex"
                  gap={2}
                  sx={{
                    overflowX: 'auto',
                    pb: 2,
                    '::-webkit-scrollbar': {
                      height: 8,
                    },
                    '::-webkit-scrollbar-track': {
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderRadius: 4,
                    },
                    '::-webkit-scrollbar-thumb': {
                      bgcolor: 'primary.main',
                      borderRadius: 4,
                    },
                  }}
                >
                  {similarBooks.map((similarBook) => (
                    <Box key={similarBook.isbn13} sx={{ minWidth: 200 }}>
                      <SimilarBookCard similarBook={similarBook} />
                    </Box>
                  ))}
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailModal;