import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from utils.validation import validate_prediction_input
from services.prediction import calculate_stock_metrics
from services.ai_service import generate_explanation

load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory storage for items
inventory_items = []

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "grocery-ai-backend"}), 200

@app.route('/api/items', methods=['GET'])
def get_items():
    # Return all items with their current metrics
    processed_items = []
    for item in inventory_items:
        metrics = calculate_stock_metrics(item['stock'], item['sales'])
        processed_items.append({
            "id": item['id'],
            "item": item['item'],
            "stock": item['stock'],
            "sales": item['sales'],
            "days_left": metrics['days_left'],
            "reorder": metrics['reorder'],
            "avg_daily_sales": metrics['avg_sales'],
            "urgency": "URGENT" if metrics['days_left'] < 3 else "MEDIUM" if metrics['days_left'] <= 7 else "SAFE"
        })
    
    # Sort by days_left ascending
    processed_items.sort(key=lambda x: x['days_left'])
    return jsonify(processed_items), 200

@app.route('/api/add-item', methods=['POST'])
def add_item():
    data = request.get_json()
    is_valid, error_msg = validate_prediction_input(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    new_item = {
        "id": len(inventory_items) + 1,
        "item": data['item'],
        "stock": data['stock'],
        "sales": data['sales']
    }
    inventory_items.append(new_item)
    return jsonify(new_item), 201

@app.route('/api/predict-all', methods=['POST'])
def predict_all():
    if not inventory_items:
        return jsonify({"error": "No items in inventory"}), 400

    processed_items = []
    urgent_items = []
    
    for item in inventory_items:
        metrics = calculate_stock_metrics(item['stock'], item['sales'])
        item_data = {
            "item": item['item'],
            "days_left": metrics['days_left'],
            "reorder": metrics['reorder'],
            "urgency": "URGENT" if metrics['days_left'] < 3 else "MEDIUM" if metrics['days_left'] <= 7 else "SAFE"
        }
        processed_items.append(item_data)
        if item_data['urgency'] == "URGENT":
            urgent_items.append(item_data)

    # Generate AI summary for urgent items
    ai_summary = ""
    if urgent_items:
        summary_prompt = f"The following items are running out soon: {', '.join([i['item'] for i in urgent_items])}. Provide a brief strategic advice for the store owner."
        ai_summary = generate_explanation("Multiple Items", 0, 0, 0) # Reusing service with custom logic if needed
        # Overriding for specific multi-item context
        from services.ai_service import genai
        try:
            model = genai.GenerativeModel('gemini-3-flash-preview')
            resp = model.generate_content(summary_prompt)
            ai_summary = resp.text.strip()
        except:
            ai_summary = "Multiple items require immediate attention. Prioritize restocking high-velocity goods."

    return jsonify({
        "predictions": processed_items,
        "ai_summary": ai_summary,
        "urgent_count": len(urgent_items)
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict_stock():
    data = request.get_json()
    
    # 1. Validation
    is_valid, error_msg = validate_prediction_input(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    item = data['item']
    stock = data['stock']
    sales = data['sales']
    
    # 2. Core Logic Computation
    metrics = calculate_stock_metrics(stock, sales)
    
    # 3. AI Enrichment
    explanation = generate_explanation(
        item, 
        stock, 
        metrics['days_left'], 
        metrics['reorder']
    )
    
    # 4. Response Construction
    response = {
        "item": item,
        "days_left": metrics['days_left'],
        "reorder": metrics['reorder'],
        "avg_daily_sales": metrics['avg_sales'],
        "explanation": explanation
    }
    
    return jsonify(response), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(host='0.0.0.0', port=port, debug=True)
