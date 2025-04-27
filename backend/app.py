from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd
from recommendation_logic import BookRecommender

app = Flask(__name__)
CORS(app)

# Load data
df = pd.read_csv('./books_dataset.csv')
df = df.drop(columns=['subtitle'])
recommender = BookRecommender(df)

@app.route('/categories', methods=['GET'])
def get_categories():
    return jsonify(recommender.get_categories())

@app.route('/recommend', methods=['POST'])
def recommend_books():
    data = request.json
    filtered_books = recommender.filter_books(
        data.get('min_year', df['published_year'].min()),
        data.get('max_year', df['published_year'].max()),
        data.get('min_rating', df['average_rating'].min()),
        data.get('max_rating', df['average_rating'].max()),
        data.get('category', 'All')
    )
    
    return jsonify(filtered_books.to_dict(orient='records'))

@app.route('/similar_books/<int:book_id>', methods=['GET'])
def get_similar_books(book_id):
    book_index = df[df['isbn13'] == book_id].index
    if len(book_index) == 0:
        return jsonify([])
    
    similar_books = recommender.get_recommendations(book_index[0])
    return jsonify(similar_books.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)