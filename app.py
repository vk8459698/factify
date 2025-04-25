from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/factcheck', methods=['POST'])
def fact_check():
    # Get the text from the request
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    
    # Create a mock response
    # In a real implementation, this would analyze the text and provide actual fact checking
    
    # Generate a random confidence score between 20 and 95
    confidence_score = random.randint(20, 95)
    
    # Determine verdict based on confidence score
    if confidence_score > 70:
        verdict = "True"
        analysis = f"After analyzing the claim, we found it to be accurate. The claim is supported by multiple reliable sources, with a confidence score of {confidence_score}%."
    elif confidence_score > 40:
        verdict = "Partially True"
        analysis = f"Our analysis indicates this claim contains some accurate elements but also has misleading or incorrect aspects. The confidence score is {confidence_score}%."
    else:
        verdict = "False"
        analysis = f"The claim appears to be false based on our analysis. Multiple sources contradict this statement, resulting in a confidence score of only {confidence_score}%."
    
    # Generate mock citations
    citations = [
        f"Research Journal {random.randint(1, 50)}, 2024",
        f"Expert Analysis by Dr. {random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])}",
        f"{random.choice(['Times', 'Post', 'Herald', 'Globe'])} article from {random.choice(['January', 'February', 'March', 'April'])} {random.randint(1, 28)}, 2024"
    ]
    
    # Create the response
    response = {
        'verdict': verdict,
        'confidence_score': confidence_score,
        'analysis': analysis,
        'citations': citations
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)