# Facty - Chrome Extension for Fact Checking

Facty is a powerful Chrome extension that helps you verify information by fact-checking selected text or entire web pages. Using advanced AI and search capabilities, Facty provides quick verification with evidence-based analysis and credible sources.

## Features

- **Text Selection Fact-Checking**: Right-click on any text on a webpage to fact-check it
- **Full Page Analysis**: Check the factual accuracy of an entire webpage with one click
- **Flexible Configuration**: Choose between using a local backend API or direct AI-powered fact-checking
- **Detailed Results**: Get a clear verdict (True, Partially True, or False) with comprehensive analysis
- **Source Citations**: View supporting evidence from multiple sources
- **Customizable Settings**: Configure API keys, number of sources, and endpoints

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The Facty extension icon should now appear in your Chrome toolbar

## Configuration

Before using Facty, you'll need to configure the extension with the necessary API keys:

### Option 1: Using Direct AI Fact-Checking (Recommended for most users)

1. Click on the Facty extension icon in your Chrome toolbar
2. Click the "Settings" button
3. Enter the following required information:
   - **AI API Key**: Your Gemini API key
   - **Search API Key**: Your Google Search API key
   - **Custom Search Engine ID**: Your Google Custom Search Engine ID
4. Click "Save"

### Option 2: Using Local Backend API

1. Start the backend server (see [Backend Setup](#backend-setup))
2. Click on the Facty extension icon in your Chrome toolbar
3. Click the "Settings" button
4. Enter the Backend API Endpoint (default: `http://127.0.0.1:5000/api/factcheck`)
5. Click "Save"

### Obtaining API Keys

For help with obtaining API keys, click the "How do I set up these keys?" link in the settings panel or visit our [setup guide](https://foil-gambler-665.notion.site/Facty-1ba60f1b8c6d80979aaad3b8ba75d08e).

## Usage

### Fact-Checking Selected Text

1. Select any text on a webpage
2. Right-click and choose "Facty - Fact-check this text"
3. A popup window will appear showing the fact-checking results

### Fact-Checking an Entire Page

1. Click on the Facty extension icon in your Chrome toolbar
2. Click the "Check This Page" button
3. Wait for the analysis to complete
4. Review the verdict, analysis, and sources

## Backend Setup

The extension includes a simple Python Flask backend that can be used for testing or as a starting point for a more robust implementation.

### Requirements
- Python 3.6+
- Flask
- Flask-CORS

### Installation

1. Navigate to the backend directory
2. Install the requirements:
   ```
   pip install flask flask-cors
   ```
3. Run the backend server:
   ```
   python app.py
   ```
4. The server will start on `http://127.0.0.1:5000`

### Backend Implementation

The current backend implementation is a mock service that returns random verdicts and confidence scores. For production use, you should implement actual fact-checking logic or connect to a fact-checking service.

## How It Works

1. When text is selected, Facty extracts the content and prepares it for analysis
2. If using direct AI fact-checking:
   - The extension searches the web for relevant information about the selected text
   - It uses Gemini AI to analyze the search results and the selected text
   - The AI generates a verdict and detailed analysis
3. If using a backend API:
   - The extension sends the text to your configured API endpoint
   - The backend processes the text and returns a verdict, analysis, and sources
4. Results are displayed in a user-friendly popup window

## Customization

You can customize several aspects of the extension:
- Number of sources to display (1-10)
- Backend API endpoint
- API keys for AI and search services

## Privacy

Facty processes text locally and only sends the selected text to the configured APIs for analysis. No personal data is collected or stored by the extension itself.

## Troubleshooting

- **Extension not working**: Make sure all API keys are correctly configured in settings
- **No results displayed**: Check your internet connection and API key validity
- **Backend connection error**: Ensure the backend server is running and accessible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
Email:vk8459698@gmail.com
Name:Vivek Kumar
## License

[MIT License](LICENSE)
