# AI Grocery Inventory Assistant - Backend

This is the Flask-based backend for the AI Grocery Inventory Prediction System. It uses statistical analysis and Gemini AI to provide inventory insights.

## Tech Stack
- **Python 3.9+**
- **Flask**: Web framework
- **Google Generative AI**: For natural language explanations
- **Python-Dotenv**: Environment variable management

## Project Structure
```text
/backend
├── app.py              # Entry point & API routes
├── services/
│   ├── prediction.py   # Statistical logic
│   └── ai_service.py   # Gemini AI integration
├── utils/
│   └── validation.py   # Input validation logic
├── .env                # Environment variables (API Keys)
└── requirements.txt    # Dependencies
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=5000
   ```

3. **Run the Server:**
   ```bash
   python app.py
   ```

## API Usage

### Predict Stock
**Endpoint:** `POST /api/predict`

**Request Body:**
```json
{
  "item": "Organic Bananas",
  "stock": 120,
  "sales": [20, 25, 18, 22, 24]
}
```

**Successful Response:**
```json
{
  "item": "Organic Bananas",
  "days_left": 5,
  "reorder": 184,
  "avg_daily_sales": 21.8,
  "explanation": "Your Organic Bananas are selling consistently. At this rate, you'll run out in 5 days. We recommend reordering 184 units to cover next week's demand plus a safety buffer."
}
```

## Logic Explanation
- **Days Left**: `Stock / Average(Last 5 Days Sales)`
- **Reorder Qty**: `Average Sales * 7 Days * 1.2 (Safety Buffer)`
