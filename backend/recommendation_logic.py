import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class BookRecommender:
    def __init__(self, dataframe):
        self.df = dataframe
        self.preprocess_data()
        
    def preprocess_data(self):
        # Combine text features for content-based recommendation
        self.df['content'] = self.df['title'] + ' ' + \
                              self.df['authors'].fillna('') + ' ' + \
                              self.df['description'].fillna('')
        
        # TF-IDF Vectorization
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.tfidf.fit_transform(self.df['content'])
        
    def filter_books(self, min_year, max_year, min_rating, max_rating, category):
        filtered_df = self.df[
            (self.df['published_year'].between(min_year, max_year)) &
            (self.df['average_rating'].between(min_rating, max_rating))
        ]
        
        if category and category != 'All':
            filtered_df = filtered_df[filtered_df['categories'].str.contains(category, na=False)]
        
        return filtered_df
    
    def get_recommendations(self, book_index, top_n=10):
        # Compute cosine similarity
        cosine_sim = cosine_similarity(self.tfidf_matrix[book_index], self.tfidf_matrix).flatten()
        
        # Get top similar book indices, excluding the input book
        similar_indices = cosine_sim.argsort()[::-1][1:top_n+1]
        
        return self.df.iloc[similar_indices]
    
    def get_categories(self):
        # Extract unique categories
        categories = self.df['categories'].str.split(',', expand=True).stack().str.strip().unique()
        return ['All'] + list(categories)