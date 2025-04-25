document.addEventListener('DOMContentLoaded', function () {
  const selectedTextElement = document.getElementById('selectedText')
  const loadingElement = document.getElementById('loading')
  const resultElement = document.getElementById('result')
  const errorElement = document.getElementById('error')
  const verdictElement = document.getElementById('verdict')
  const analysisElement = document.getElementById('analysis')
  const sourcesElement = document.getElementById('sources')
  const settingsButton = document.getElementById('settingsBtn')
  
  // New button for checking the entire page
  const checkPageButton = document.getElementById('checkPageBtn')

  chrome.storage.local.get(['lastSelectedText'], function (data) {
    if (data.lastSelectedText) {
      selectedTextElement.textContent = data.lastSelectedText
    } else {
      selectedTextElement.textContent = 'No text selected'
    }
  })

  checkFactCheckStatus()

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.factCheckStatus) {
      checkFactCheckStatus()
    }
  })

  settingsButton.addEventListener('click', function () {
    toggleSettingsPanel()
  })

  // Add event listener for the new "Check This Page" button
  if (checkPageButton) {
    checkPageButton.addEventListener('click', function() {
      // Show loading state
      showLoading()
      
      // Send message to background script to check the current page
      chrome.runtime.sendMessage({ action: 'checkCurrentPage' }, (response) => {
        if (response && response.status === 'error') {
          showError(response.message)
        }
      })
    })
  }

  function checkFactCheckStatus() {
    chrome.storage.local.get(
      ['factCheckStatus', 'factCheckResult'],
      function (data) {
        if (data.factCheckStatus === 'loading') {
          showLoading()
        } else if (
          data.factCheckStatus === 'complete' &&
          data.factCheckResult
        ) {
          showResult(data.factCheckResult)
        } else if (data.factCheckStatus === 'error') {
          showError(data.factCheckResult)
        }
      }
    )
  }

  function showLoading() {
    loadingElement.classList.remove('hidden')
    resultElement.classList.add('hidden')
    errorElement.classList.add('hidden')

    const settingsPanel = document.getElementById('settingsPanel')
    if (settingsPanel) {
      settingsPanel.classList.add('hidden')
    }
  }

  function showResult(result) {
    loadingElement.classList.add('hidden')
    resultElement.classList.remove('hidden')
    errorElement.classList.add('hidden')

    try {
      verdictElement.textContent = result.verdict
      verdictElement.className =
        'verdict ' + result.verdict.toLowerCase().replace(' ', '-')

      analysisElement.innerHTML = sanitizeAndFormatAnalysis(result.analysis)

      sourcesElement.innerHTML = ''
      if (result.sources && result.sources.length > 0) {
        result.sources.forEach((source) => {
          if (!source.title) return

          const li = document.createElement('li')
          
          if (source.link && source.link !== '#') {
            const a = document.createElement('a')
            a.href = sanitizeUrl(source.link)
            a.textContent = sanitizeText(source.title)
            a.target = '_blank'
            a.rel = 'noopener noreferrer' 
            li.appendChild(a)
          } else {
            // For sources without links (like from the mock API)
            const span = document.createElement('span')
            span.textContent = sanitizeText(source.title)
            span.className = 'source-title'
            li.appendChild(span)
          }

          if (source.snippet) {
            const snippet = document.createElement('p')
            snippet.className = 'source-snippet'
            snippet.textContent = sanitizeText(source.snippet)
            li.appendChild(snippet)
          }

          sourcesElement.appendChild(li)
        })
      } else {
        const li = document.createElement('li')
        li.textContent = 'No specific sources found'
        sourcesElement.appendChild(li)
      }
    } catch (error) {
      console.error('Error displaying result:', error)
      showError('Failed to display results properly. Please try again.')
    }
  }

  function showError(errorMessage) {
    loadingElement.classList.add('hidden')
    resultElement.classList.add('hidden')
    errorElement.classList.remove('hidden')

    const errorParagraph = errorElement.querySelector('p')
    if (errorMessage && errorParagraph) {
      errorParagraph.textContent =
        typeof errorMessage === 'string'
          ? errorMessage
          : 'An unknown error occurred'
    }
  }

  function sanitizeAndFormatAnalysis(text) {
    if (!text || typeof text !== 'string') {
      return 'No analysis available'
    }

    const sanitizedText = sanitizeText(text)

    return sanitizedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n\n/g, '<br><br>') // Paragraphs
      .replace(/- (.*?)(?:\n|$)/g, '• $1<br>') // Bullet points
      .replace(/\d+\. (.*?)(?:\n|$)/g, '$&<br>') // Numbered lists
  }

  function sanitizeText(text) {
    if (!text) return ''
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function sanitizeUrl(url) {
    if (!url) return '#'
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'javascript:') {
        return '#'
      }
      return url
    } catch (e) {
      return '#'
    }
  }

  function toggleSettingsPanel() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    let settingsPanel = document.getElementById('settingsPanel')

    if (settingsPanel) {
      if (settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.remove('hidden')
      } else {
        settingsPanel.classList.add('hidden')
      }
      return
    }

    settingsPanel = document.createElement('div')
    settingsPanel.id = 'settingsPanel'
    settingsPanel.className = 'settings-panel'

    settingsPanel.innerHTML = `
      <h2>Settings</h2>
      <form id="settingsForm">
        <div class="form-group">
          <label for="apiEndpoint">Backend API Endpoint:</label>
          <input type="text" id="apiEndpoint" placeholder="http://127.0.0.1:5000/api/factcheck">
          <small>Leave empty to use direct AI fact checking</small>
        </div>

        <div class="form-group">
          <label for="aiApiKey">AI API Key:</label>
          <input type="password" id="aiApiKey" placeholder="Enter your Gemini API key">
        </div>
        
        <div class="form-group">
          <label for="searchApiKey">Search API Key:</label>
          <input type="password" id="searchApiKey" placeholder="Enter your Google Search API key">
        </div>
        
        <div class="form-group">
          <label for="searchEngineId">Custom Search Engine ID:</label>
          <input type="text" id="searchEngineId" placeholder="Enter your Custom Search Engine ID">
        </div>
        
        <div class="form-group">
          <label for="numSources">Number of sources to display:</label>
          <input type="number" id="numSources" min="1" max="10" value="5">
        </div>
        
        <div class="help-link">
          <a href="https://foil-gambler-665.notion.site/Facty-1ba60f1b8c6d80979aaad3b8ba75d08e" target="_blank" rel="noopener noreferrer">How do I set up these keys?</a>
        </div>
        
        <div class="button-group">
          <button type="button" id="saveSettingsBtn" class="save-button">Save</button>
          <button type="button" id="cancelSettingsBtn" class="cancel-button">Cancel</button>
        </div>
      </form>
    `

    document.querySelector('.container').appendChild(settingsPanel)

    chrome.storage.local.get(
      ['aiApiKey', 'searchApiKey', 'searchEngineId', 'numSources', 'apiEndpoint'],
      function (data) {
        if (data.aiApiKey) {
          document.getElementById('aiApiKey').value = data.aiApiKey
        }
        if (data.searchApiKey) {
          document.getElementById('searchApiKey').value = data.searchApiKey
        }
        if (data.searchEngineId) {
          document.getElementById('searchEngineId').value = data.searchEngineId
        }
        if (data.numSources) {
          document.getElementById('numSources').value = data.numSources
        }
        if (data.apiEndpoint) {
          document.getElementById('apiEndpoint').value = data.apiEndpoint
        }
      }
    )

    document
      .getElementById('saveSettingsBtn')
      .addEventListener('click', function () {
        const aiApiKey = document.getElementById('aiApiKey').value.trim()
        const searchApiKey = document
          .getElementById('searchApiKey')
          .value.trim()
        const searchEngineId = document
          .getElementById('searchEngineId')
          .value.trim()
        const numSourcesInput = document.getElementById('numSources')
        const numSources = parseInt(numSourcesInput.value)
        const apiEndpoint = document.getElementById('apiEndpoint').value.trim()

        let hasError = false
        let errorMessage = ''

        if (numSources < 1 || numSources > 10 || isNaN(numSources)) {
          numSourcesInput.classList.add('error')
          hasError = true
          errorMessage = 'Number of sources must be between 1 and 10'
        } else {
          numSourcesInput.classList.remove('error')
        }

        if (hasError) {
          const errorMsg = document.createElement('p')
          errorMsg.className = 'error-message'
          errorMsg.textContent = errorMessage

          const existingError = document.querySelector('.error-message')
          if (existingError) existingError.remove()

          const form = document.getElementById('settingsForm')
          form.appendChild(errorMsg)
          return
        }

        chrome.storage.local.set(
          {
            aiApiKey: aiApiKey,
            searchApiKey: searchApiKey,
            searchEngineId: searchEngineId,
            numSources: numSources,
            apiEndpoint: apiEndpoint
          },
          function () {
            const successMsg = document.createElement('p')
            successMsg.className = 'success-message'
            successMsg.textContent = 'Settings saved successfully!'

            const existingMsg = document.querySelector(
              '.success-message, .error-message'
            )
            if (existingMsg) existingMsg.remove()

            const form = document.getElementById('settingsForm')
            form.appendChild(successMsg)

            setTimeout(function () {
              successMsg.remove()
              settingsPanel.classList.add('hidden')
            }, 2000)
          }
        )
      })

    document
      .getElementById('cancelSettingsBtn')
      .addEventListener('click', function () {
        settingsPanel.classList.add('hidden')
      })
  }
})