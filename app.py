# # app.py
# from flask import Flask, render_template, request, jsonify, session, redirect, url_for
# import sqlite3
# import pandas as pd
# import os
# import json
# from werkzeug.security import generate_password_hash, check_password_hash
# from werkzeug.utils import secure_filename
# import csv
# import io
# from datetime import datetime,timezone
# from collections import defaultdict
# # now = datetime.utcnow().isoformat()
# now = datetime.now(timezone.utc).isoformat()


# # Optionally you'd use a library for OCR functionality
# # import pytesseract
# # from PIL import Image

# app = Flask(__name__,static_folder='static', template_folder='templates')
# app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret')

# # Database setup
# def get_db_connection():
#     conn = sqlite3.connect('finance_tracker.db')
#     conn.row_factory = sqlite3.Row
#     conn.execute('PRAGMA foreign_keys = ON')
#     return conn

# def init_db():
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute('''
#     CREATE TABLE IF NOT EXISTS users (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         username TEXT UNIQUE NOT NULL,
#         email TEXT UNIQUE NOT NULL,
#         password TEXT NOT NULL
#     )
#     ''')
    
#     cursor.execute('''
#     CREATE TABLE IF NOT EXISTS transactions (
#         id INTEGER PRIMARY KEY AUTOINCREMENT,
#         user_id INTEGER NOT NULL,
#         type TEXT NOT NULL CHECK(type IN ('Income', 'Expense')),
#         category TEXT NOT NULL,
#         subcategory TEXT,
#         note TEXT,
#         amount REAL NOT NULL,
#         mode TEXT DEFAULT 'manual',
#         date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#         FOREIGN KEY (user_id) REFERENCES users (id)
#     )
#     ''')
    
#     conn.commit()
#     conn.close()

# # Initialize database
# init_db()

# # Routes
# @app.route('/')
# def index():
#     if 'user_id' in session:
#         return redirect(url_for('dashboard'))
#     return render_template('index.html')

# @app.route('/dashboard')
# def dashboard():
#     if 'user_id' not in session:
#         return redirect(url_for('index'))
#     return render_template('dashboard.html')

# @app.route('/signup', methods=['POST'])
# def signup():
#     data = request.json
    
#     # Validate data
#     if not data or not data.get('username') or not data.get('email') or not data.get('password'):
#         return jsonify({'error': 'Missing required fields'}), 400
    
#     username = data.get('username')
#     email = data.get('email')
#     password = generate_password_hash(data.get('password'))
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     try:
#         cursor.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
#                       (username, email, password))
#         conn.commit()
#         return jsonify({'message': 'Signup successful!'}), 201
#     except sqlite3.IntegrityError:
#         return jsonify({'error': 'Username or email already exists'}), 400
#     finally:
#         conn.close()

# @app.route('/login', methods=['POST'])
# def login():
#     data = request.json
    
#     if not data or not data.get('email') or not data.get('password'):
#         return jsonify({'error': 'Missing required fields'}), 400
    
#     # Basic password strength check
#     if len(data.get('password')) < 6:
#         return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    
#     email = data.get('email')
#     password = data.get('password')
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     user = cursor.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
#     conn.close()
    
#     if user and check_password_hash(user['password'], password):
#         session['user_id'] = user['id']
#         session['username'] = user['username']
#         return jsonify({'message': 'Login successful!'}), 200
    
#     return jsonify({'error': 'Invalid email or password'}), 401

# @app.route('/logout')
# def logout():
#     session.pop('user_id', None)
#     session.pop('username', None)
#     return redirect(url_for('index'))

# @app.route('/user_info')
# def user_info():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     return jsonify({'username': session.get('username')})

# @app.route('/add_transaction', methods=['POST'])
# def add_transaction():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     category = request.form.get('category')
#     subcategory = request.form.get('subcategory', '')
#     note = request.form.get('note', '')
#     amount = request.form.get('amount')
    
#     if not category or not amount:
#         return jsonify({'error': 'Missing required fields'}), 400
    
#     try:
#         amount = float(amount)
#     except ValueError:
#         return jsonify({'error': 'Amount must be a number'}), 400
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     txn_type = request.form.get('type', 'Expense').title()
#     if txn_type not in ['Income', 'Expense']:
#         txn_type = 'Expense'

#     cursor.execute('''
#     INSERT INTO transactions (user_id, type, category, subcategory, note, amount)
#     VALUES (?, ?, ?, ?, ?, ?)
#     ''', (session['user_id'], txn_type, category, subcategory, note, amount))

    
#     conn.commit()
#     conn.close()
    
#     return jsonify({'message': 'Transaction added successfully'})

# # @app.route('/upload_csv', methods=['POST'])
# # def upload_csv():
# #     if 'user_id' not in session:
# #         return jsonify({'error': 'Not logged in'}), 401
    
# #     if 'file' not in request.files:
# #         return jsonify({'error': 'No file provided'}), 400

# #     file = request.files['file']

# #     if file.filename == '':
# #         return jsonify({'error': 'No file selected'}), 400

# #     if not file.filename.endswith('.csv'):
# #         return jsonify({'error': 'File must be a CSV'}), 400

# #     try:
# #         # Read CSV
# #         stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
# #         csv_reader = csv.DictReader(stream)
# #         rows = list(csv_reader)

# #         if not rows:
# #             return jsonify({'error': 'CSV is empty or invalid format'}), 400

# #         # Print out headers to debug
# #         headers = list(rows[0].keys())
        
# #         # Check for required columns
# #         required_columns = ['category', 'amount']
# #         missing_columns = [col for col in required_columns if col.lower() not in [h.lower() for h in headers]]
        
# #         if missing_columns:
# #             return jsonify({'error': f'CSV missing required columns: {", ".join(missing_columns)}'}), 400

# #         # Map column names to standardized names (case-insensitive)
# #         column_mapping = {}
# #         for header in headers:
# #             lower_header = header.lower().strip()
# #             if lower_header == 'category':
# #                 column_mapping['category'] = header
# #             elif lower_header == 'amount':
# #                 column_mapping['amount'] = header
# #             elif lower_header == 'type':
# #                 column_mapping['type'] = header
# #             elif lower_header == 'subcategory':
# #                 column_mapping['subcategory'] = header
# #             elif lower_header == 'note':
# #                 column_mapping['note'] = header

# #         conn = get_db_connection()
# #         cursor = conn.cursor()

# #         count = 0
# #         # Group rows by category for preview
# #         category_samples = defaultdict(list)
        
# #         for row in rows:
# #             # Extract data using the mapped column names
# #             category = row.get(column_mapping.get('category')) or 'Uncategorized'
            
# #             # Store sample for preview (max 3 per category)
# #             if len(category_samples[category]) < 3:
# #                 category_samples[category].append(row)
            
# #             # Process transaction for database
# #             txn_type = 'Expense'
# #             if 'type' in column_mapping:
# #                 txn_type = row.get(column_mapping.get('type'), 'Expense').title()
# #                 if txn_type not in ['Income', 'Expense']:
# #                     txn_type = 'Expense'
            
# #             subcategory = ''
# #             if 'subcategory' in column_mapping:
# #                 subcategory = row.get(column_mapping.get('subcategory')) or ''
                
# #             note = ''
# #             if 'note' in column_mapping:
# #                 note = row.get(column_mapping.get('note')) or ''
                
# #             try:
# #                 amount = float(row.get(column_mapping.get('amount'), 0))
# #             except (ValueError, TypeError):
# #                 amount = 0.0

# #             cursor.execute('''
# #             INSERT INTO transactions (user_id, type, category, subcategory, note, amount, mode)
# #             VALUES (?, ?, ?, ?, ?, ?, ?)''', (
# #                 session['user_id'], txn_type, category, subcategory, note, amount, 'csv'
# #             ))
# #             count += 1

# #         conn.commit()
# #         conn.close()

# #         # Prepare preview data - list format for easier frontend display
# #         preview_data = []
# #         for category, rows in category_samples.items():
# #             for row in rows:
# #                 preview_data.append(row)

# #         return jsonify({
# #             'message': f'Successfully imported {count} transactions',
# #             'headers': headers,
# #             'preview': preview_data
# #         })

# #     except Exception as e:
# #         print(f"CSV Upload Error: {str(e)}")  # Server-side logging
# #         return jsonify({'error': f'Error processing CSV: {str(e)}'}), 400

# @app.route('/upload_csv', methods=['POST'])
# def upload_csv():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file provided'}), 400

#     file = request.files['file']

#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     if not file.filename.endswith('.csv'):
#         return jsonify({'error': 'File must be a CSV'}), 400

#     try:
#         # Read CSV
#         stream = io.StringIO(file.stream.read().decode("UTF8", errors='replace'), newline=None)
#         csv_reader = csv.DictReader(stream)
#         rows = list(csv_reader)

#         if not rows:
#             return jsonify({'error': 'CSV is empty or invalid format'}), 400

#         # Get all headers and create a case-insensitive lookup dictionary
#         original_headers = list(rows[0].keys())
#         headers_lookup = {h.lower().strip(): h for h in original_headers}
        
#         # Check for required columns (case-insensitive)
#         required_columns = ['category', 'amount']
#         missing_columns = []
        
#         for required in required_columns:
#             if required.lower() not in headers_lookup:
#                 missing_columns.append(required)
        
#         if missing_columns:
#             return jsonify({'error': f'CSV missing required columns: {", ".join(missing_columns)}'}), 400

#         # Define function to get value using case-insensitive lookup
#         def get_value(row, field_name):
#             # Look for the field using case-insensitive matching
#             for key in row:
#                 if key.lower().strip() == field_name.lower():
#                     return row[key]
#             return None
            
#         conn = get_db_connection()
#         cursor = conn.cursor()

#         count = 0
#         # Group rows by category for preview (max 3 per category)
#         category_samples = defaultdict(list)
        
#         for row in rows:
#             # Get all values using case-insensitive matching
#             category = get_value(row, 'category') or 'Uncategorized'
            
#             # Create a normalized row with standardized keys for preview display
#             normalized_row = {
#                 'category': category,
#                 'amount': get_value(row, 'amount') or '0.0',
#                 'type': get_value(row, 'type') or 'Expense',
#                 'subcategory': get_value(row, 'subcategory') or '',
#                 'note': get_value(row, 'note') or ''
#             }
            
#             # Also include any additional columns from the original CSV
#             for header in original_headers:
#                 if header.lower().strip() not in ['category', 'amount', 'type', 'subcategory', 'note']:
#                     normalized_row[header] = row[header]
            
#             # Store sample for preview (max 3 per category)
#             if len(category_samples[category]) < 3:
#                 category_samples[category].append(normalized_row)
            
#             # Process transaction for database
#             txn_type = get_value(row, 'type') or 'Expense'
#             txn_type = txn_type.title()
#             if txn_type not in ['Income', 'Expense']:
#                 txn_type = 'Expense'
            
#             subcategory = get_value(row, 'subcategory') or ''
#             note = get_value(row, 'note') or ''
            
#             try:
#                 amount_str = get_value(row, 'amount')
#                 # Remove any currency symbols or commas that might cause parsing issues
#                 if amount_str:
#                     amount_str = amount_str.replace('₹', '').replace(',', '').strip()
#                 amount = float(amount_str) if amount_str else 0.0
#             except (ValueError, TypeError):
#                 amount = 0.0

#             cursor.execute('''
#             INSERT INTO transactions (user_id, type, category, subcategory, note, amount, mode)
#             VALUES (?, ?, ?, ?, ?, ?, ?)''', (
#                 session['user_id'], txn_type, category, subcategory, note, amount, 'csv'
#             ))
#             count += 1

#         conn.commit()
#         conn.close()

#         # Prepare preview data - list format for easier frontend display
#         preview_data = []
#         for category, category_rows in category_samples.items():
#             for row in category_rows:
#                 preview_data.append(row)

#         return jsonify({
#             'message': f'Successfully imported {count} transactions',
#             'headers': original_headers,
#             'preview': preview_data
#         })

#     except Exception as e:
#         print(f"CSV Upload Error: {str(e)}")  # Server-side logging
#         return jsonify({'error': f'Error processing CSV: {str(e)}'}), 400
    
# @app.route('/upload_receipt', methods=['POST'])
# def upload_receipt():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file provided'}), 400
    
#     file = request.files['file']
    
#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400
    
#     # In a real application, you would:
#     # 1. Save the file temporarily
#     # 2. Process it with OCR
#     # 3. Extract transaction data
#     # 4. Save to database
    
#     # This is just a placeholder - in a real app you'd use OCR
#     # Example with pytesseract (commented out):
#     # image = Image.open(file.stream)
#     # text = pytesseract.image_to_string(image)
#     # Process the text to extract transaction data
    
#     # For now, we'll just add a placeholder transaction
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute('''
#     INSERT INTO transactions (user_id, category, amount, mode)
#     VALUES (?, ?, ?, ?)
#     ''', (session['user_id'], 'Receipt Upload', 0.00, 'receipt'))
    
#     conn.commit()
#     conn.close()
    
#     return jsonify({'message': 'Receipt uploaded. Implement OCR to extract data.'})

# @app.route('/get_transactions')
# def get_transactions():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     LIMIT = 20
#     OFFSET = int(request.args.get('offset', 0))
#     transactions = cursor.execute('''
#     SELECT * FROM transactions 
#     WHERE user_id = ? 
#     ORDER BY date DESC
#     LIMIT ? OFFSET ?
#     ''', (session['user_id'], LIMIT, OFFSET)).fetchall()
    
#     # Convert to list of dicts
#     transaction_list = []
#     for txn in transactions:
#         transaction_list.append({
#             'id': txn['id'],
#             'type': txn['type'],
#             'category': txn['category'],
#             'subcategory': txn['subcategory'],
#             'note': txn['note'],
#             'amount': txn['amount'],
#             'mode': txn['mode'],
#             'date': txn['date']
#         })
    
#     income_total = 0.0
#     expense_total = 0.0
#     for txn in transaction_list:
#         txn_type = txn.get('type', 'Expense')
#         if txn_type == 'Income':
#             income_total += txn['amount']
#         else:
#             expense_total += txn['amount']

#     net_savings = income_total - expense_total
#     budget_advice = (
#         f"Total Income: ₹{income_total:.2f}, Total Expenses: ₹{expense_total:.2f}, Net Savings: ₹{net_savings:.2f}"
#     )

    
#     conn.close()
    
#     return jsonify({
#         'transactions': transaction_list,
#         'budget_advice': budget_advice
#     })

# @app.route('/get_budget_advice')
# def get_budget_advice():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     transactions = cursor.execute('''
#     SELECT category, SUM(amount) as total
#     FROM transactions 
#     WHERE user_id = ? AND type='Expense'
#     GROUP BY category
#     ORDER BY total DESC
#     ''', (session['user_id'],)).fetchall()
    
#     conn.close()
    
#     if not transactions:
#         return jsonify({'advice': 'No transaction data available for budget analysis.'})
    
#     # Generate simple advice based on spending patterns
#     # In a real app, this would be more sophisticated

#     highest_category = transactions[0]['category']
#     highest_amount = transactions[0]['total']
    
#     advice = f"Your highest spending category is '{highest_category}' at ₹{highest_amount:.2f}."
    
#     if len(transactions) > 1:
#         advice += f" Consider reducing spending in this category."
    
#     return jsonify({'advice': advice})



# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import pandas as pd
import numpy as np
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import csv
import io
from datetime import datetime, timezone
from collections import defaultdict

# Machine Learning imports
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
import pickle
import joblib

now = datetime.now(timezone.utc).isoformat()

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret')

# Database setup
def get_db_connection():
    conn = sqlite3.connect('finance_tracker.db')
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Income', 'Expense')),
        category TEXT NOT NULL,
        subcategory TEXT,
        note TEXT,
        amount REAL NOT NULL,
        mode TEXT DEFAULT 'manual',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# ML Model paths
MODEL_DIR = 'ml_models'
os.makedirs(MODEL_DIR, exist_ok=True)
CATEGORY_MODEL_PATH = os.path.join(MODEL_DIR, 'category_classifier.pkl')
AMOUNT_MODEL_PATH = os.path.join(MODEL_DIR, 'amount_regressor.pkl')
ENCODERS_PATH = os.path.join(MODEL_DIR, 'encoders.pkl')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')

# ML Models and encoders (initialized as None, will be loaded or trained as needed)
category_classifier = None
amount_regressor = None
label_encoders = None
tfidf_vectorizer = None

def load_ml_models():
    """Load ML models if they exist, otherwise return None"""
    global category_classifier, amount_regressor, label_encoders, tfidf_vectorizer
    
    try:
        if os.path.exists(CATEGORY_MODEL_PATH):
            category_classifier = joblib.load(CATEGORY_MODEL_PATH)
        
        if os.path.exists(AMOUNT_MODEL_PATH):
            amount_regressor = joblib.load(AMOUNT_MODEL_PATH)
            
        if os.path.exists(ENCODERS_PATH):
            label_encoders = joblib.load(ENCODERS_PATH)
            
        if os.path.exists(VECTORIZER_PATH):
            tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
    
    except Exception as e:
        print(f"Error loading ML models: {e}")
        category_classifier = None
        amount_regressor = None
        label_encoders = None
        tfidf_vectorizer = None

# Load models at startup
load_ml_models()

def train_ml_models(user_id=None):
    """Train ML models on transaction data"""
    global category_classifier, amount_regressor, label_encoders, tfidf_vectorizer
    
    conn = get_db_connection()
    
    # If user_id is provided, only train on that user's data
    # Otherwise train on all data (could be useful for initial system-wide model)
    if user_id:
        query = "SELECT * FROM transactions WHERE user_id = ? AND type = 'Expense'"
        params = (user_id,)
    else:
        query = "SELECT * FROM transactions WHERE type = 'Expense'"
        params = ()
    
    # Load transaction data into pandas DataFrame
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    
    # Check if we have enough data to train (at least 10 records)
    if len(df) < 10:
        return False, "Not enough transaction data to train models (need at least 10 expense records)"
    
    # Preprocess data
    df = df.dropna(subset=['category', 'amount'])
    
    # Fill missing values
    df['note'] = df['note'].fillna('')
    df['subcategory'] = df['subcategory'].fillna('')
    df['mode'] = df['mode'].fillna('manual')
    
    # Initialize encoders
    le_mode = LabelEncoder()
    le_subcat = LabelEncoder()
    
    # Encode categorical features
    df['mode_encoded'] = le_mode.fit_transform(df['mode'])
    df['subcategory_encoded'] = le_subcat.fit_transform(df['subcategory'])
    
    # Store encoders
    label_encoders = {
        'mode': le_mode,
        'subcategory': le_subcat
    }
    
    # Vectorize text notes
    tfidf_vectorizer = TfidfVectorizer(max_features=100)
    X_note = tfidf_vectorizer.fit_transform(df['note']).toarray()
    
    # Combine features
    X = np.concatenate([
        X_note,
        df[['amount', 'mode_encoded', 'subcategory_encoded']].values
    ], axis=1)
    
    # Target variables
    y_category = df['category']
    y_amount = df['amount']
    
    # Train category classifier
    category_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    category_classifier.fit(X, y_category)
    
    # Train amount regressor
    amount_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    amount_regressor.fit(X, y_amount)
    
    # Save models and preprocessing tools
    joblib.dump(category_classifier, CATEGORY_MODEL_PATH)
    joblib.dump(amount_regressor, AMOUNT_MODEL_PATH)
    joblib.dump(label_encoders, ENCODERS_PATH)
    joblib.dump(tfidf_vectorizer, VECTORIZER_PATH)
    
    return True, "ML models trained successfully"

def predict_category_and_amount(note, subcategory='', mode='manual', amount=0):
    """Predict category and amount based on transaction details"""
    if not category_classifier or not amount_regressor:
        return None, None
    
    try:
        # Encode categorical features
        mode_encoded = label_encoders['mode'].transform([mode])[0]
        
        # Handle unseen subcategories by defaulting to most frequent
        try:
            subcategory_encoded = label_encoders['subcategory'].transform([subcategory])[0]
        except ValueError:
            # If subcategory is unseen, use the most frequent index
            subcategory_encoded = 0
        
        # Vectorize note
        note_features = tfidf_vectorizer.transform([note]).toarray()
        
        # Combine features
        features = np.concatenate([
            note_features,
            np.array([[amount, mode_encoded, subcategory_encoded]])
        ], axis=1)
        
        # Make predictions
        category = category_classifier.predict(features)[0]
        
        # For amount prediction, use a different model
        if amount == 0:  # Only predict amount if not provided
            predicted_amount = amount_regressor.predict(features)[0]
        else:
            predicted_amount = amount
        
        return category, predicted_amount
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return None, None

def generate_budget_advice(user_id):
    """Generate personalized budget advice using transaction data and ML insights"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get total income and expenses
    income = cursor.execute(
        'SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = "Income"',
        (user_id,)
    ).fetchone()[0] or 0
    
    expenses = cursor.execute(
        'SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = "Expense"',
        (user_id,)
    ).fetchone()[0] or 0
    
    # Get top spending categories
    top_categories = cursor.execute('''
        SELECT category, SUM(amount) as total
        FROM transactions 
        WHERE user_id = ? AND type = 'Expense'
        GROUP BY category
        ORDER BY total DESC
        LIMIT 3
    ''', (user_id,)).fetchall()
    
    # Get spending trend (last 30 days vs. previous 30 days)
    current_month = cursor.execute('''
        SELECT SUM(amount) FROM transactions 
        WHERE user_id = ? AND type = 'Expense' 
        AND date >= date('now', '-30 days')
    ''', (user_id,)).fetchone()[0] or 0
    
    previous_month = cursor.execute('''
        SELECT SUM(amount) FROM transactions 
        WHERE user_id = ? AND type = 'Expense' 
        AND date < date('now', '-30 days') 
        AND date >= date('now', '-60 days')
    ''', (user_id,)).fetchone()[0] or 0
    
    conn.close()
    
    # Calculate net savings and savings rate
    net_savings = income - expenses
    savings_rate = (net_savings / income * 100) if income > 0 else 0
    
    # Generate advice
    advice = []
    
    # Basic financial summary
    advice.append(f"💰 Total Income: ₹{income:.2f}")
    advice.append(f"💸 Total Expenses: ₹{expenses:.2f}")
    advice.append(f"🏦 Net Savings: ₹{net_savings:.2f} ({savings_rate:.1f}% of income)")
    
    # Top spending categories
    if top_categories:
        advice.append("\n📊 Top spending categories:")
        for i, (category, amount) in enumerate(top_categories):
            advice.append(f"  {i+1}. {category}: ₹{amount:.2f}")
        
        # Recommendation for highest category
        highest_category = top_categories[0][0]
        advice.append(f"\n👉 Recommendation: Consider reducing spending in '{highest_category}' as it's your highest expense.")
    
    # Spending trend
    if current_month > 0 and previous_month > 0:
        percent_change = ((current_month - previous_month) / previous_month) * 100
        if percent_change > 10:
            advice.append(f"\n⚠️ Your spending increased by {percent_change:.1f}% compared to the previous month.")
        elif percent_change < -10:
            advice.append(f"\n✅ Great job! Your spending decreased by {abs(percent_change):.1f}% compared to the previous month.")
    
    # 50/30/20 rule check (50% needs, 30% wants, 20% savings)
    if income > 0:
        if savings_rate < 20:
            advice.append("\n💡 Try to aim for at least 20% savings rate for good financial health.")
        else:
            advice.append("\n🌟 Your savings rate is excellent! Keep up the good work.")
    
    return "\n".join(advice)

# Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('dashboard.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    
    # Validate data
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = generate_password_hash(data.get('password'))
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                      (username, email, password))
        conn.commit()
        return jsonify({'message': 'Signup successful!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Basic password strength check
    if len(data.get('password')) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    user = cursor.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({'message': 'Login successful!'}), 200
    
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/user_info')
def user_info():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    return jsonify({'username': session.get('username')})

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    category = request.form.get('category')
    subcategory = request.form.get('subcategory', '')
    note = request.form.get('note', '')
    amount = request.form.get('amount')
    
    if not category or not amount:
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'error': 'Amount must be a number'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    txn_type = request.form.get('type', 'Expense').title()
    if txn_type not in ['Income', 'Expense']:
        txn_type = 'Expense'

    cursor.execute('''
    INSERT INTO transactions (user_id, type, category, subcategory, note, amount)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], txn_type, category, subcategory, note, amount))

    
    conn.commit()
    conn.close()
    
    # Retrain ML models if we have enough data (happens in background)
    train_ml_models(session['user_id'])
    
    return jsonify({'message': 'Transaction added successfully'})

# @app.route('/upload_csv', methods=['POST'])
# def upload_csv():
#     if 'user_id' not in session:
#         return jsonify({'error': 'Not logged in'}), 401
    
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file provided'}), 400

#     file = request.files['file']

#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     if not file.filename.endswith('.csv'):
#         return jsonify({'error': 'File must be a CSV'}), 400

#     try:
#         # Read CSV
#         stream = io.StringIO(file.stream.read().decode("UTF8", errors='replace'), newline=None)
#         csv_reader = csv.DictReader(stream)
#         rows = list(csv_reader)

#         if not rows:
#             return jsonify({'error': 'CSV is empty or invalid format'}), 400

#         # Get all headers and create a case-insensitive lookup dictionary
#         original_headers = list(rows[0].keys())
#         headers_lookup = {h.lower().strip(): h for h in original_headers}
        
#         # Check for required columns (case-insensitive)
#         required_columns = ['category', 'amount']
#         missing_columns = []
        
#         for required in required_columns:
#             if required.lower() not in headers_lookup:
#                 missing_columns.append(required)
        
#         if missing_columns:
#             return jsonify({'error': f'CSV missing required columns: {", ".join(missing_columns)}'}), 400

#         # Define function to get value using case-insensitive lookup
#         def get_value(row, field_name):
#             # Look for the field using case-insensitive matching
#             for key in row:
#                 if key.lower().strip() == field_name.lower():
#                     return row[key]
#             return None
            
#         conn = get_db_connection()
#         cursor = conn.cursor()

#         count = 0
#         # Group rows by category for preview (max 3 per category)
#         category_samples = defaultdict(list)
        
#         for row in rows:
#             # Get all values using case-insensitive matching
#             category = get_value(row, 'category') or 'Uncategorized'
            
#             # Create a normalized row with standardized keys for preview display
#             normalized_row = {
#                 'category': category,
#                 'amount': get_value(row, 'amount') or '0.0',
#                 'type': get_value(row, 'type') or 'Expense',
#                 'subcategory': get_value(row, 'subcategory') or '',
#                 'note': get_value(row, 'note') or ''
#             }
            
#             # Also include any additional columns from the original CSV
#             for header in original_headers:
#                 if header.lower().strip() not in ['category', 'amount', 'type', 'subcategory', 'note']:
#                     normalized_row[header] = row[header]
            
#             # Store sample for preview (max 3 per category)
#             if len(category_samples[category]) < 3:
#                 category_samples[category].append(normalized_row)
            
#             # Process transaction for database
#             txn_type = get_value(row, 'type') or 'Expense'
#             txn_type = txn_type.title()
#             if txn_type not in ['Income', 'Expense']:
#                 txn_type = 'Expense'
            
#             subcategory = get_value(row, 'subcategory') or ''
#             note = get_value(row, 'note') or ''
            
#             try:
#                 amount_str = get_value(row, 'amount')
#                 # Remove any currency symbols or commas that might cause parsing issues
#                 if amount_str:
#                     amount_str = amount_str.replace('₹', '').replace(',', '').strip()
#                 amount = float(amount_str) if amount_str else 0.0
#             except (ValueError, TypeError):
#                 amount = 0.0

#             cursor.execute('''
#             INSERT INTO transactions (user_id, type, category, subcategory, note, amount, mode)
#             VALUES (?, ?, ?, ?, ?, ?, ?)''', (
#                 session['user_id'], txn_type, category, subcategory, note, amount, 'csv'
#             ))
#             count += 1

#         conn.commit()
#         conn.close()

#         # Prepare preview data - list format for easier frontend display
#         preview_data = []
#         for category, category_rows in category_samples.items():
#             for row in category_rows:
#                 preview_data.append(row)

#         # Retrain ML models with new data (happens in background)
#         train_ml_models(session['user_id'])

#         return jsonify({
#             'message': f'Successfully imported {count} transactions',
#             'headers': original_headers,
#             'preview': preview_data
#         })

#     except Exception as e:
#         print(f"CSV Upload Error: {str(e)}")  # Server-side logging
#         return jsonify({'error': f'Error processing CSV: {str(e)}'}), 400

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    try:
        # Check if file exists in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Log file info for debugging
        app.logger.info(f"Processing CSV file: {file.filename}")
        
        # Read CSV with proper error handling
        try:
            # Save content as string first for debugging if needed
            file_content = file.read()
            file.seek(0)  # Reset file pointer after reading
            
            # Handle potential encoding issues
            try:
                stream = io.StringIO(file_content.decode("UTF8", errors='replace'), newline=None)
            except UnicodeDecodeError:
                # Try a different encoding if UTF-8 fails
                stream = io.StringIO(file_content.decode("latin-1", errors='replace'), newline=None)
            
            csv_reader = csv.DictReader(stream)
            rows = list(csv_reader)
            
            if not rows:
                return jsonify({'error': 'CSV is empty or invalid format'}), 400
                
            # Log row count for debugging
            app.logger.info(f"CSV contains {len(rows)} rows")
            
        except Exception as csv_error:
            app.logger.error(f"Error parsing CSV: {str(csv_error)}")
            return jsonify({'error': f'Could not parse CSV file: {str(csv_error)}'}), 400

        # Get all headers and create a case-insensitive lookup dictionary
        original_headers = list(rows[0].keys())
        app.logger.info(f"CSV headers: {original_headers}")
        headers_lookup = {h.lower().strip(): h for h in original_headers}
        
        # Check for required columns (case-insensitive)
        required_columns = ['category', 'amount']
        missing_columns = []
        
        for required in required_columns:
            if required.lower() not in headers_lookup:
                missing_columns.append(required)
        
        if missing_columns:
            return jsonify({'error': f'CSV missing required columns: {", ".join(missing_columns)}'}), 400

        # Define function to get value using case-insensitive lookup
        def get_value(row, field_name):
            # Look for the field using case-insensitive matching
            for key in row:
                if key.lower().strip() == field_name.lower():
                    return row[key]
            return None
            
        conn = get_db_connection()
        cursor = conn.cursor()

        count = 0
        # Group rows by category for preview (max 3 per category)
        category_samples = defaultdict(list)
        imported_transactions = []
        
        for row in rows:
            # Get all values using case-insensitive matching
            category = get_value(row, 'category') or 'Uncategorized'
            
            # Create a normalized row with standardized keys for preview display
            normalized_row = {
                'category': category,
                'amount': get_value(row, 'amount') or '0.0',
                'type': get_value(row, 'type') or 'Expense',
                'subcategory': get_value(row, 'subcategory') or '',
                'note': get_value(row, 'note') or ''
            }
            
            # Also include any additional columns from the original CSV
            for header in original_headers:
                if header.lower().strip() not in ['category', 'amount', 'type', 'subcategory', 'note']:
                    normalized_row[header] = row[header]
            
            # Store sample for preview (max 3 per category)
            if len(category_samples[category]) < 3:
                category_samples[category].append(normalized_row)
            
            # Process transaction for database
            txn_type = get_value(row, 'type') or 'Expense'
            txn_type = txn_type.title()
            if txn_type not in ['Income', 'Expense']:
                txn_type = 'Expense'
            
            subcategory = get_value(row, 'subcategory') or ''
            note = get_value(row, 'note') or ''
            
            try:
                amount_str = get_value(row, 'amount')
                # Remove any currency symbols or commas that might cause parsing issues
                if amount_str:
                    amount_str = str(amount_str).replace('₹', '').replace(',', '').strip()
                amount = float(amount_str) if amount_str else 0.0
            except (ValueError, TypeError) as e:
                app.logger.warning(f"Error converting amount '{amount_str}': {str(e)}")
                amount = 0.0

            try:
                cursor.execute('''
                INSERT INTO transactions (user_id, type, category, subcategory, note, amount, mode)
                VALUES (?, ?, ?, ?, ?, ?, ?)''', (
                    session['user_id'], txn_type, category, subcategory, note, amount, 'csv'
                ))
                
                # Get the last inserted row ID
                transaction_id = cursor.lastrowid
                
                # Add to our list of imported transactions
                imported_transactions.append({
                    'id': transaction_id,
                    'type': txn_type,
                    'category': category,
                    'subcategory': subcategory,
                    'note': note,
                    'amount': amount,
                    'mode': 'csv',
                    'date': datetime.now(timezone.utc).isoformat()
                })
                
                count += 1
            except sqlite3.Error as db_error:
                app.logger.error(f"Database error inserting row: {str(db_error)}")
                # Continue with other rows even if one fails

        conn.commit()
        conn.close()

        # Prepare preview data - list format for easier frontend display
        preview_data = []
        for category, category_rows in category_samples.items():
            for row in category_rows:
                preview_data.append(row)

        # Retrain ML models with new data (happens in background)
        try:
            # Don't wait for training to complete
            import threading
            thread = threading.Thread(target=train_ml_models, args=(session['user_id'],))
            thread.daemon = True
            thread.start()
        except Exception as e:
            app.logger.error(f"Error starting model training: {str(e)}")
            # Don't fail the upload if model training fails

        app.logger.info(f"CSV upload complete: {count} transactions imported")
        
        return jsonify({
            'message': f'Successfully imported {count} transactions',
            'headers': original_headers,
            'preview': preview_data,
            'transactions': imported_transactions  # Add the actual imported transactions to the response
        })

    except Exception as e:
        app.logger.error(f"CSV Upload Error: {str(e)}")
        return jsonify({'error': f'Error processing CSV: {str(e)}'}), 400
    
@app.route('/upload_receipt', methods=['POST'])
def upload_receipt():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # In a real application, you would:
    # 1. Save the file temporarily
    # 2. Process it with OCR
    # 3. Extract transaction data
    # 4. Save to database
    
    # This is just a placeholder - in a real app you'd use OCR
    # Example with pytesseract (commented out):
    # image = Image.open(file.stream)
    # text = pytesseract.image_to_string(image)
    # Process the text to extract transaction data
    
    # For now, we'll just add a placeholder transaction
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO transactions (user_id, category, amount, mode)
    VALUES (?, ?, ?, ?)
    ''', (session['user_id'], 'Receipt Upload', 0.00, 'receipt'))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Receipt uploaded. Implement OCR to extract data.'})

@app.route('/get_transactions')
def get_transactions():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor()
    LIMIT = 20
    OFFSET = int(request.args.get('offset', 0))
    transactions = cursor.execute('''
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY date DESC
    LIMIT ? OFFSET ?
    ''', (session['user_id'], LIMIT, OFFSET)).fetchall()
    
    # Convert to list of dicts
    transaction_list = []
    for txn in transactions:
        transaction_list.append({
            'id': txn['id'],
            'type': txn['type'],
            'category': txn['category'],
            'subcategory': txn['subcategory'],
            'note': txn['note'],
            'amount': txn['amount'],
            'mode': txn['mode'],
            'date': txn['date']
        })
    
    # Generate smart budget advice using the ML-powered function
    budget_advice = generate_budget_advice(session['user_id'])
    
    conn.close()
    
    return jsonify({
        'transactions': transaction_list,
        'budget_advice': budget_advice
    })

@app.route('/get_budget_advice')
def get_budget_advice():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    # Use the new ML-powered budget advice function
    advice = generate_budget_advice(session['user_id'])
    
    return jsonify({'advice': advice})

@app.route('/predict_category', methods=['POST'])
def predict_category():
    """API endpoint to predict category based on transaction details"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    # Check if models are loaded
    if not category_classifier or not tfidf_vectorizer or not label_encoders:
        # Try to train models first
        success, message = train_ml_models(session['user_id'])
        if not success:
            return jsonify({'error': message}), 400
    
    # Get input data
    note = request.form.get('note', '')
    subcategory = request.form.get('subcategory', '')
    mode = request.form.get('mode', 'manual')
    
    try:
        amount = float(request.form.get('amount', 0))
    except (ValueError, TypeError):
        amount = 0
    
    # Make prediction
    predicted_category, predicted_amount = predict_category_and_amount(
        note, subcategory, mode, amount
    )
    
    if predicted_category is None:
        return jsonify({'error': 'Unable to make prediction'}), 400
    
    return jsonify({
        'predicted_category': predicted_category,
        'predicted_amount': float(predicted_amount) if amount == 0 else None
    })

@app.route('/train_models', methods=['POST'])
def train_models_endpoint():
    """API endpoint to manually trigger model training"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    success, message = train_ml_models(session['user_id'])
    
    if success:
        return jsonify({'message': message})
    else:
        return jsonify({'error': message}), 400

@app.route('/get_spending_insights')
def get_spending_insights():
    """Get ML-powered insights about spending patterns"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    conn = get_db_connection()
    
    # Get monthly spending by category
    df = pd.read_sql_query('''
        SELECT 
            strftime('%Y-%m', date) as month,
            category,
            SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'Expense'
        GROUP BY month, category
        ORDER BY month, total DESC
    ''', conn, params=(session['user_id'],))
    
    # Get overall stats
    total_spending = pd.read_sql_query('''
        SELECT 
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income
        FROM transactions
        WHERE user_id = ?
    ''', conn, params=(session['user_id'],))
    
    conn.close()
    
    # Skip insights if not enough data
    if len(df) == 0:
        return jsonify({
            'message': 'Not enough data for insights',
            'insights': []
        })
    
    # Calculate insights
    insights = []
    
    # Format the data for the insights
    monthly_data = defaultdict(dict)
    categories = set()
    
    for _, row in df.iterrows():
        monthly_data[row['month']][row['category']] = row['total']
        categories.add(row['category'])
    
    # Sort months chronologically
    months = sorted(monthly_data.keys())
    
    if len(months) >= 2:
        # Compare current month with previous month
        current_month = months[-1]
        previous_month = months[-2]
        
        # For each category, check if spending increased or decreased
        for category in categories:
            current_spend = monthly_data[current_month].get(category, 0)
            previous_spend = monthly_data[previous_month].get(category, 0)
            
            if previous_spend > 0 and current_spend > 0:
                percent_change = ((current_spend - previous_spend) / previous_spend) * 100
                
                if percent_change > 20:
                    insights.append({
                        'type': 'increase',
                        'category': category,
                        'percent': round(percent_change, 1),
                        'message': f"Your spending on {category} increased by {round(percent_change, 1)}% compared to last month"
                    })
                elif percent_change < -20:
                    insights.append({
                        'type': 'decrease',
                        'category': category,
                        'percent': round(abs(percent_change), 1),
                        'message': f"Great job! Your spending on {category} decreased by {round(abs(percent_change), 1)}% compared to last month"
                    })
    
    # If we have total income/expense data
    if not total_spending.empty:
        total_expenses = total_spending['total_expenses'].iloc[0] or 0
        total_income = total_spending['total_income'].iloc[0] or 0
        
        if total_income > 0:
            savings_rate = ((total_income - total_expenses) / total_income) * 100
            
            if savings_rate < 0:
                insights.append({
                    'type': 'warning',
                    'message': f"Warning: You're spending more than you earn. Consider reducing expenses."
                })
            elif savings_rate < 10:
                insights.append({
                    'type': 'warning',
                    'message': f"Your savings rate is {round(savings_rate, 1)}%. Consider saving at least 20% of your income."
                })
            elif savings_rate > 30:
                insights.append({
                    'type': 'positive',
                    'message': f"Excellent! Your savings rate is {round(savings_rate, 1)}%, which is above the recommended 20%."
                })
    
    return jsonify({
        'insights': insights
    })

if __name__ == '__main__':
    app.run(debug=True)