import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_explanation(item, stock, days_left, reorder):
    """
    Generates a human-friendly explanation using AI.
    """
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        prompt = f"""
        You are an expert inventory consultant for a small grocery store.
        Item: {item}
        Current Stock: {stock}
        Predicted Days Left: {days_left}
        Recommended Reorder: {reorder}
        
        Provide a concise, professional, and encouraging 2-3 sentence explanation for the store owner. 
        Explain the urgency and why the reorder quantity was chosen.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"AI Service Error: {e}")
        return f"Based on current sales, {item} will last approximately {days_left} days. We recommend ordering {reorder} units to stay ahead of demand."
