// Set up the extension when installed
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for selecting text (keeping your existing functionality)
  chrome.contextMenus.create({
    id: 'factCheckSelection',
    title: 'Facty - Fact-check this text',
    contexts: ['selection'],
  })

  // Initialize storage with default values
  chrome.storage.local.get(['numSources', 'apiEndpoint'], function (data) {
    if (!data.numSources) {
      chrome.storage.local.set({ numSources: 5 })
    }
    if (!data.apiEndpoint) {
      chrome.storage.local.set({ apiEndpoint: 'http://127.0.0.1:5000/api/factcheck' })
    }
  })

  chrome.storage.local.get(['aiApiKey', 'searchApiKey', 'searchEngineId'], function (data) {
    if (!data.aiApiKey) {
      chrome.storage.local.set({ aiApiKey: '' })
    }
    if (!data.searchApiKey) {
      chrome.storage.local.set({ searchApiKey: '' })
    }
    if (!data.searchEngineId) {
      chrome.storage.local.set({ searchEngineId: '' }) 
    }
  })
})

// Handle context menu clicks (keeping your existing functionality)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'factCheckSelection') {
    const selectedText = info.selectionText

    chrome.storage.local.set({
      lastSelectedText: selectedText,
      factCheckStatus: 'loading',
      factCheckResult: null,
    })

    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 500,
      height: 600,
    })

    factCheckText(selectedText)
  }
})

// New function to extract and check the entire page content
async function checkEntirePage(tabId) {
  try {
    chrome.storage.local.set({
      factCheckStatus: 'loading',
      factCheckResult: null,
    })

    // Execute content script to extract page text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageContent
    })

    // Get the text from the first result
    const pageText = results[0].result

    // Store the extracted text
    chrome.storage.local.set({
      lastSelectedText: pageText.substring(0, 300) + (pageText.length > 300 ? '...' : '')
    })

    // Fact check the extracted text
    await factCheckText(pageText)
  } catch (error) {
    console.error('Error checking page:', error)
    chrome.storage.local.set({
      factCheckStatus: 'error',
      factCheckResult: `Error: ${error.message}`,
    })
  }
}

// Function to extract content from the page
function extractPageContent() {
  try {
    // Simple extraction using innerText
    // You could use Readability.js for better extraction
    let content = document.body.innerText

    // Clean up the content (remove excessive whitespace)
    content = content.replace(/\s+/g, ' ').trim()

    // Limit content length to avoid overwhelming the API
    const maxLength = 5000
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...'
    }

    return content
  } catch (error) {
    return `Error extracting content: ${error.message}`
  }
}

// Modified to support both API and direct calls
async function factCheckText(text) {
  try {
    chrome.storage.local.set({ factCheckStatus: 'loading' })

    const {
      numSources = 5,
      aiApiKey,
      searchApiKey,
      searchEngineId,
      apiEndpoint,
    } = await chrome.storage.local.get([
      'numSources',
      'aiApiKey',
      'searchApiKey',
      'searchEngineId',
      'apiEndpoint',
    ])

    // If API endpoint is configured and valid, use it
    if (apiEndpoint && apiEndpoint.startsWith('http')) {
      return await factCheckWithBackend(text, apiEndpoint)
    }

    // Otherwise, fall back to direct method (your existing implementation)
    if (!aiApiKey || !searchApiKey || !searchEngineId) {
      throw new Error(
        'API keys or Search Engine ID not configured. Please set them in the settings panel.'
      )
    }

    const searchResults = await searchWeb(text, searchApiKey, searchEngineId)

    if (!searchResults || searchResults.length === 0) {
      throw new Error(
        'No search results found. Please try again or check your search API key.'
      )
    }

    const aiAnalysis = await analyzeWithAI(text, searchResults, aiApiKey)

    if (!aiAnalysis || !aiAnalysis.verdict) {
      throw new Error(
        'AI analysis failed. Please check your AI API key and try again.'
      )
    }

    const result = {
      verdict: aiAnalysis.verdict,
      analysis: aiAnalysis.analysis,
      sources: searchResults.slice(0, parseInt(numSources)).map((result) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      })),
    }

    chrome.storage.local.set({
      factCheckStatus: 'complete',
      factCheckResult: result,
    })
  } catch (error) {
    console.error('Error during fact checking:', error)
    chrome.storage.local.set({
      factCheckStatus: 'error',
      factCheckResult: `Error: ${error.message}`,
    })
  }
}

// New function to use backend API
async function factCheckWithBackend(text, apiEndpoint) {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process the API response
    const result = {
      verdict: data.verdict || (data.confidence_score > 70 ? 'True' : data.confidence_score > 30 ? 'Partially True' : 'False'),
      analysis: data.analysis || `This claim has been verified with a confidence score of ${data.confidence_score}%.`,
      sources: data.citations ? data.citations.map(citation => ({
        title: citation,
        link: '#',
        snippet: 'Citation from backend API'
      })) : []
    }

    chrome.storage.local.set({
      factCheckStatus: 'complete',
      factCheckResult: result,
    })
  } catch (error) {
    console.error('Backend API error:', error)
    throw new Error(`Backend API error: ${error.message}`)
  }
}

// Keep your existing functions
async function searchWeb(query, apiKey, searchEngineId) {
  try {
    if (!apiKey) {
      throw new Error('Search API key is missing')
    }

    if (!searchEngineId) {
      throw new Error('Search Engine ID is missing')
    }

    const searchQuery = `fact check ${query}`
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
      searchQuery
    )}`

    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Search API error: ${errorData?.error?.message || response.statusText}`
      )
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.items?.slice(0, 10) || []
  } catch (error) {
    console.error('Web search error:', error)
    throw new Error(`Search failed: ${error.message}`)
  }
}

async function analyzeWithAI(text, searchResults, apiKey) {
  try {
    if (!apiKey) {
      throw new Error('AI API key is missing')
    }

    let searchContext = searchResults
      .map(
        (result) =>
          `Source: ${result.title}\nURL: ${result.link}\nExcerpt: ${result.snippet}`
      )
      .join('\n\n')

    const prompt = `You are a fact-checking assistant. Analyze the following claim based on these search results:

CLAIM: "${text}"

SEARCH RESULTS:
${searchContext}

Based on ONLY these search results, please:
1. Determine if the claim is True, False, or Partially True
2. Provide a brief analysis explaining your reasoning
3. DO NOT make up or hallucinate information not found in the search results
4. DO NOT cite sources that aren't in these search results

Format your response as:
VERDICT: [True/False/Partially True]

ANALYSIS:
[Your detailed analysis explaining the verdict, citing information from the search results]`

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `AI API error: ${errorData?.error?.message || response.statusText}`
      )
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error.message)
    }

    const content =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Analysis unavailable'

    const verdictMatch = content.match(
      /VERDICT:\s*(True|False|Partially True)/i
    )
    const verdict = verdictMatch ? verdictMatch[1] : 'Uncertain'

    const analysisMatch = content.match(/ANALYSIS:([\s\S]+)/i)
    const analysis = analysisMatch ? analysisMatch[1].trim() : content

    return {
      verdict: verdict,
      analysis: analysis,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

// Add listener for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkCurrentPage') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        await checkEntirePage(tabs[0].id);
        sendResponse({ status: 'started' });
      } else {
        sendResponse({ status: 'error', message: 'No active tab found' });
      }
    });
    return true; // Required for async sendResponse
  }
});