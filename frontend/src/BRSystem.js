import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Slider,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  IconButton,
  TextField,
  Chip,
  Fade,
  Paper,
  Rating,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Skeleton,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  TuneRounded,
  GridViewRounded,
  ViewCarouselRounded,
  SearchRounded,
  ClearAllRounded,
  BookmarkBorderRounded,
  BookmarkRounded,
  SortRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import BookDetailModal from "./BookDetailModal";

const BookRecommendationSystem = ({user, onLogout}) => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const categories = user.preferredGenres;
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedBooks, setSavedBooks] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    min_year: 1900,
    max_year: new Date().getFullYear(),
    min_rating: 3.0,
    max_rating: 5.0,
    category: `${user.preferredGenres[0]}`,
  });

  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Popular categories for quick filters
  const popularCategories = ["Fiction", "Science", "History", "Romance", "Technology"];

  

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/recommend", filters);
      const booksData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching recommendations", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      min_year: 1900,
      max_year: new Date().getFullYear(),
      min_rating: 3.0,
      max_rating: 5.0,
      category: `${user.preferredGenres[0]}`,
    });
    setSearchTerm('');
  };

  const toggleSaveBook = (book) => {
    setSavedBooks(prev => 
      prev.some(b => b.isbn13 === book.isbn13) 
        ? prev.filter(b => b.isbn13 !== book.isbn13)
        : [...prev, book]
    );
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Implement search logic here
  };

  const handleYearChange = (_, newValue) => {
    setFilters(prev => ({
      ...prev,
      min_year: newValue[0],
      max_year: newValue[1],
    }));
  };

  const handleRatingChange = (_, newValue) => {
    setFilters(prev => ({
      ...prev,
      min_rating: newValue[0],
      max_rating: newValue[1],
    }));
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleRecommendation();
    }, 500); // Wait 500ms after filter changes before fetching

    return () => clearTimeout(debounceTimer);
  }, [filters]); // This will trigger handleRecommendation whenever filters change

  // Update the quick filter chip handler
  const handleQuickFilterClick = (category) => {
    setFilters(prev => ({
      ...prev,
      category
    }));
    // No need to call handleRecommendation here as it will be triggered by the useEffect above
  };

  <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
    {popularCategories.map((category) => (
      <Chip
        key={category}
        label={category}
        onClick={() => handleQuickFilterClick(category)}
        color={filters.category === category ? "primary" : "default"}
      />
    ))}
  </Box>

  // Filter drawer content
  const FilterDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 320,
          p: 3,
          background: theme.palette.background.default,
        }
      }}
    >
      <Typography variant="h6" gutterBottom>Filters</Typography>
      <List>
        <ListItem>
          <Box width="100%">
            <Typography gutterBottom>Publication Year</Typography>
            <Slider
              value={[filters.min_year, filters.max_year]}
              onChange={handleYearChange}
              valueLabelDisplay="auto"
              min={1900}
              max={new Date().getFullYear()}
            />
          </Box>
        </ListItem>
        <ListItem>
          <Box width="100%">
            <Typography gutterBottom>Rating Range</Typography>
            <Slider
              value={[filters.min_rating, filters.max_rating]}
              onChange={handleRatingChange}
              valueLabelDisplay="auto"
              min={1.0}
              max={5.0}
              step={0.1}
            />
          </Box>
        </ListItem>
        <ListItem>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) =>
                setFilters(prev => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
      </List>
      <Box mt={2} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<ClearAllRounded />}
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </Box>
    </Drawer>
  );

  const BookCard = ({ book, saved }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Paper
        elevation={2}
        sx={{
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveBook(book);
          }}
        >
          {saved ? <BookmarkRounded color="primary" /> : <BookmarkBorderRounded />}
        </IconButton>
        <Box
          onClick={() => handleBookClick(book)}
          sx={{ cursor: 'pointer' }}
        >
          <img
            src={book.thumbnail || "placeholder.jpg"}
            alt={book.title}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
            }}
          />
          <CardContent>
            <Typography variant="h6" noWrap>
              {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {book.authors}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Rating value={book.average_rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" ml={1}>
                ({book.average_rating})
              </Typography>
            </Box>
            <Chip 
              label={book.category || filters.category}
              size="small"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Box>
      </Paper>
    </motion.div>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            📚 BookFinder
          </Typography>
          <IconButton onClick={() => setViewMode(prev => prev === 'grid' ? 'carousel' : 'grid')}>
            {viewMode === 'grid' ? <ViewCarouselRounded /> : <GridViewRounded />}
          </IconButton>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <TuneRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom>
            Discover Your Next Favorite Book
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            Explore our curated collection of books and find your perfect match
          </Typography>
          
          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton sx={{ p: '10px' }}>
              <SearchRounded />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={handleSearch}
              variant="standard"
              InputProps={{ disableUnderline: true }}
            />
          </Paper>

          {/* Quick Filters */}
          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
            {popularCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setFilters(prev => ({ ...prev, category }))}
                color={filters.category === category ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="All Books" />
          <Tab label="Saved Books" />
        </Tabs>

        {/* Books Grid/Carousel */}
        <AnimatePresence>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(8)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Skeleton variant="rectangular" height={400} />
                </Grid>
              ))}
            </Grid>
          ) : (
            viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {(currentTab === 0 ? books : savedBooks).map((book) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.isbn13}>
                    <BookCard
                      book={book}
                      saved={savedBooks.some(b => b.isbn13 === book.isbn13)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                display="flex"
                gap={2}
                sx={{
                  overflowX: 'auto',
                  pb: 2,
                  '::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {(currentTab === 0 ? books : savedBooks).map((book) => (
                  <Box key={book.isbn13} sx={{ minWidth: 280 }}>
                    <BookCard
                      book={book}
                      saved={savedBooks.some(b => b.isbn13 === book.isbn13)}
                    />
                  </Box>
                ))}
              </Box>
            )
          )}
        </AnimatePresence>
      </Container>

      <FilterDrawer />
      
      <BookDetailModal
        book={selectedBook}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export default BookRecommendationSystem;