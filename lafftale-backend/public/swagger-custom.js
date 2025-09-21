// Lafftale API Swagger UI Custom JavaScript

window.addEventListener('DOMContentLoaded', function () {
  console.log('🎮 Lafftale API Documentation Loaded');

  // Add custom functionality
  enhanceSwaggerUI();
  addCustomFeatures();
  setupKeyboardShortcuts();
});

function enhanceSwaggerUI() {
  // Add last update timestamp
  const topbar = document.querySelector('.swagger-ui .topbar');
  if (topbar) {
    const timestamp = document.createElement('div');
    timestamp.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.8);
      font-size: 12px;
    `;
    timestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
    topbar.appendChild(timestamp);
  }

  // Enhance operation blocks with custom indicators
  setTimeout(() => {
    document.querySelectorAll('.opblock').forEach((block) => {
      const method = block.className.match(/opblock-(\w+)/)?.[1];
      if (method) {
        addMethodBadge(block, method);
      }
    });
  }, 1000);
}

function addMethodBadge(block, method) {
  const badges = {
    get: { emoji: '📖', label: 'Read' },
    post: { emoji: '✨', label: 'Create' },
    put: { emoji: '✏️', label: 'Update' },
    delete: { emoji: '🗑️', label: 'Delete' },
    patch: { emoji: '🔧', label: 'Modify' },
  };

  const badge = badges[method];
  if (badge) {
    const summary = block.querySelector('.opblock-summary');
    if (summary) {
      const indicator = document.createElement('span');
      indicator.style.cssText = `
        display: inline-block;
        margin-right: 8px;
        font-size: 16px;
        opacity: 0.8;
      `;
      indicator.textContent = badge.emoji;
      indicator.title = badge.label;
      summary.insertBefore(indicator, summary.firstChild);
    }
  }
}

function addCustomFeatures() {
  // Add API health check button
  addHealthCheckButton();

  // Add copy curl command functionality
  enhanceCurlCopy();

  // Add response time measurement
  measureResponseTimes();
}

function addHealthCheckButton() {
  const topbar = document.querySelector('.swagger-ui .topbar');
  if (topbar) {
    const healthButton = document.createElement('button');
    healthButton.textContent = '🔍 Health Check';
    healthButton.style.cssText = `
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 15px;
      font-size: 12px;
    `;

    healthButton.onclick = async () => {
      try {
        const response = await fetch('/api');
        const data = await response.json();
        alert(`API Status: ${data.status}\nVersion: ${data.version}\nTime: ${data.timestamp}`);
      } catch (error) {
        alert(`API Health Check Failed: ${error.message}`);
      }
    };

    topbar.appendChild(healthButton);
  }
}

function enhanceCurlCopy() {
  // Enhanced curl command copying with better formatting
  document.addEventListener('click', function (e) {
    if (e.target.textContent?.includes('curl')) {
      setTimeout(() => {
        const curlCommand = e.target.textContent;
        navigator.clipboard?.writeText(curlCommand);
        showNotification('📋 cURL command copied to clipboard!');
      }, 100);
    }
  });
}

function measureResponseTimes() {
  // Intercept execute buttons to measure response times
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('execute')) {
      const startTime = performance.now();

      // Monitor for response
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.classList?.contains('responses-wrapper')) {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            addResponseTimeIndicator(mutation.target, responseTime);
            observer.disconnect();
          }
        });
      });

      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  });
}

function addResponseTimeIndicator(responseWrapper, time) {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    background: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    display: inline-block;
    margin: 5px 0;
  `;
  indicator.textContent = `⚡ Response time: ${time}ms`;
  responseWrapper.insertBefore(indicator, responseWrapper.firstChild);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const searchInput = document.querySelector('.swagger-ui input[placeholder*="Filter"]');
      if (searchInput) {
        searchInput.focus();
        showNotification('🔍 Search activated');
      }
    }

    // Ctrl/Cmd + R to refresh documentation
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
      e.preventDefault();
      refreshDocumentation();
    }
  });
}

async function refreshDocumentation() {
  try {
    showNotification('🔄 Refreshing documentation...');
    const response = await fetch('/api-docs/refresh');
    const result = await response.json();

    if (result.success) {
      showNotification('✅ Documentation refreshed successfully!');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification('❌ Failed to refresh documentation');
    }
  } catch (error) {
    showNotification('❌ Error refreshing documentation');
  }
}

function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation keyframes if not exist
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// API Documentation Statistics
function addDocumentationStats() {
  setTimeout(() => {
    const operations = document.querySelectorAll('.opblock').length;
    const schemas = document.querySelectorAll('.model-container').length;

    console.log(`📊 Lafftale API Documentation Statistics:
      - Operations: ${operations}
      - Schemas: ${schemas}
      - Last Build: ${new Date().toISOString()}
    `);
  }, 2000);
}

// Initialize statistics
addDocumentationStats();

// Export for external use
window.LafftaleSwaggerEnhancements = {
  refreshDocumentation,
  showNotification,
  addMethodBadge,
};
