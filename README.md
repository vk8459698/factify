Facty - Chrome Extension for Fact Checking
Facty is a powerful Chrome extension that helps you verify information by fact-checking selected text or entire web pages. Using advanced AI and search capabilities, Facty provides quick verification with evidence-based analysis and credible sources.
Features

Text Selection Fact-Checking: Right-click on any text on a webpage to fact-check it
Full Page Analysis: Check the factual accuracy of an entire webpage with one click
Flexible Configuration: Choose between using a local backend API or direct AI-powered fact-checking
Detailed Results: Get a clear verdict (True, Partially True, or False) with comprehensive analysis
Source Citations: View supporting evidence from multiple sources
Customizable Settings: Configure API keys, number of sources, and endpoints

Installation

Download or clone this repository to your local machine
Open Chrome and navigate to chrome://extensions/
Enable "Developer mode" using the toggle in the top-right corner
Click "Load unpacked" and select the extension directory
The Facty extension icon should now appear in your Chrome toolbar

Configuration
Before using Facty, you'll need to configure the extension with the necessary API keys:
Option 1: Using Direct AI Fact-Checking (Recommended for most users)

Click on the Facty extension icon in your Chrome toolbar
Click the "Settings" button
Enter the following required information:

AI API Key: Your Gemini API key
Search API Key: Your Google Search API key
Custom Search Engine ID: Your Google Custom Search Engine ID


Click "Save"

Option 2: Using Local Backend API

Start the backend server (see Backend Setup)
Click on the Facty extension icon in your Chrome toolbar
Click the "Settings" button
Enter the Backend API Endpoint (default: http://127.0.0.1:5000/api/factcheck)
Click "Save"

Obtaining API Keys
For help with obtaining API keys, click the "How do I set up these keys?" link in the settings panel or visit our setup guide.
Usage
Fact-Checking Selected Text

Select any text on a webpage
Right-click and choose "Facty - Fact-check this text"
A popup window will appear showing the fact-checking results

Fact-Checking an Entire Page

Click on the Facty extension icon in your Chrome toolbar
Click the "Check This Page" button
Wait for the analysis to complete
Review the verdict, analysis, and sources

Backend Setup
The extension includes a simple Python Flask backend that can be used for testing or as a starting point for a more robust implementation.
Requirements

Python 3.6+
Flask
Flask-CORS

Installation

Navigate to the backend directory
Install the requirements:
pip install flask flask-cors

Run the backend server:
python app.py

The server will start on http://127.0.0.1:5000

Backend Implementation
The current backend implementation is a mock service that returns random verdicts and confidence scores. For production use, you should implement actual fact-checking logic or connect to a fact-checking service.
How It Works

When text is selected, Facty extracts the content and prepares it for analysis
If using direct AI fact-checking:

The extension searches the web for relevant information about the selected text
It uses Gemini AI to analyze the search results and the selected text
The AI generates a verdict and detailed analysis


If using a backend API:

The extension sends the text to your configured API endpoint
The backend processes the text and returns a verdict, analysis, and sources


Results are displayed in a user-friendly popup window

Customization
You can customize several aspects of the extension:

Number of sources to display (1-10)
Backend API endpoint
API keys for AI and search services

Privacy
Facty processes text locally and only sends the selected text to the configured APIs for analysis. No personal data is collected or stored by the extension itself.
Troubleshooting

Extension not working: Make sure all API keys are correctly configured in settings
No results displayed: Check your internet connection and API key validity
Backend connection error: Ensure the backend server is running and accessible

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
MIT License
