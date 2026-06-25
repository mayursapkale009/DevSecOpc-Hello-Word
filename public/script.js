document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==========================================================================
  // 1. THEME SWITCHER
  // ==========================================================================
  const themeButtons = document.querySelectorAll('.theme-btn');
  const activeTheme = localStorage.getItem('app-theme') || 'slate-dark';
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', activeTheme);
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme-val') === activeTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const themeVal = button.getAttribute('data-theme-val');
      document.documentElement.setAttribute('data-theme', themeVal);
      localStorage.setItem('app-theme', themeVal);
      
      themeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // ==========================================================================
  // 2. TABBED NAVIGATION
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update active tab buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update visible content blocks
      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
      
      // Re-trigger layout updates for specific tabs
      if (targetTab === 'architecture') {
        resetArchitectureInspector();
      }
    });
  });

  // ==========================================================================
  // 3. READING PROGRESS & NAVIGATION ACTIVE STATES
  // ==========================================================================
  const mainContent = document.querySelector('.main-content');
  const readingProgress = document.getElementById('readingProgress');
  const navLinks = document.querySelectorAll('.nav-links a');
  const stepCards = document.querySelectorAll('.step-card, .guide-intro, .guide-conclusion');

  // Track progress on scroll inside main panel
  mainContent.addEventListener('scroll', () => {
    const totalHeight = mainContent.scrollHeight - mainContent.clientHeight;
    if (totalHeight > 0) {
      const scrolled = (mainContent.scrollTop / totalHeight) * 100;
      readingProgress.style.width = `${scrolled}%`;
    }

    // Scrollspy to highlight active sidebar index link
    let currentId = 'introduction';
    stepCards.forEach(card => {
      const cardTop = card.offsetTop - 120;
      if (mainContent.scrollTop >= cardTop) {
        currentId = card.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll links from sidebar
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Force display guide tab if navigation link was clicked
      const guideTabBtn = document.querySelector('[data-tab="guide"]');
      if (!guideTabBtn.classList.contains('active')) {
        guideTabBtn.click();
      }

      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        mainContent.scrollTo({
          top: targetElement.offsetTop - 40,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // 4. COPY-TO-CLIPBOARD ACTIONS
  // ==========================================================================
  const copyElements = document.querySelectorAll('.copy-btn, .copy-icon-btn');

  copyElements.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = btn.innerHTML;
        
        // Show success state
        btn.classList.add('success');
        if (btn.classList.contains('copy-btn')) {
          btn.innerHTML = `<i data-lucide="check"></i> Copied!`;
        } else {
          btn.innerHTML = `<i data-lucide="check"></i>`;
        }
        
        if (window.lucide) {
          window.lucide.createIcons();
        }

        // Reset state after 2 seconds
        setTimeout(() => {
          btn.classList.remove('success');
          btn.innerHTML = originalHTML;
          if (window.lucide) {
            window.lucide.createIcons();
          }
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });

  // ==========================================================================
  // 5. INTERACTIVE ARCHITECTURE INSPECTOR
  // ==========================================================================
  const archToggleBtns = document.querySelectorAll('.toggle-btn');
  const archViews = document.querySelectorAll('.architecture-view');
  const interactiveNodes = document.querySelectorAll('.interactive-node');
  const nodePanel = document.getElementById('node-info-panel');
  const panelEmptyState = nodePanel.querySelector('.panel-empty-state');
  const panelContent = nodePanel.querySelector('.panel-content');
  
  // Data Store for Node Explanations
  const nodeInfoData = {
    domain: {
      title: "DNS & Custom Domain",
      tag: "Domain Name System",
      desc: "Purchased domain cybershieldd.online and created subdomain mayur.cybershieldd.online. Added a DNS 'A' Record pointing to AWS EC2 Elastic Public IP. Discovered and cleared duplicate legacy A-records which caused routing loops and SSL validation issues during troubleshooting.",
      code: `; DNS Domain Record Mapping
mayur.cybershieldd.online.  300  IN  A  3.6.58.203`
    },
    nginx: {
      title: "Nginx Reverse Proxy",
      tag: "Gateway Server",
      desc: "Handles incoming public HTTP (80) and HTTPS (443) traffic. Acts as a secure intermediary layer, terminating TLS/SSL encryption and forwarding raw requests downstream to the Node.js application process listening locally on Port 3000.",
      code: `# Nginx Server Config (Proxy Routing)
server {
    listen 443 ssl;
    server_name mayur.cybershieldd.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}`
    },
    pm2: {
      title: "PM2 Process Manager",
      tag: "Application Daemonizer",
      desc: "Runs the Express Node.js application in background processes, ensuring zero-downtime execution even after SSH shell logout. Automatically restarts application instances in case of system reboots or unhandled application errors.",
      code: `# Start and persist process
pm2 start index.js --name index
pm2 save
pm2 startup`
    },
    nodeapp: {
      title: "Node.js Express Server",
      tag: "Application Host",
      desc: "Hosts the application business logic, APIs, and serves static files. Configured to listen on localhost Port 3000 inside the Linux shell, completely shielded from direct public internet exposure by the Nginx reverse proxy layer.",
      code: `// Server Listening Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Express application listening");
});`
    }
  };

  // Switch between Final and Initial diagrams
  archToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewVal = btn.getAttribute('data-arch');
      archToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      archViews.forEach(view => {
        if (view.id === `arch-${viewVal}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      resetArchitectureInspector();
    });
  });

  // Node Clicking Logic
  interactiveNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeKey = node.getAttribute('data-node');
      const data = nodeInfoData[nodeKey];

      if (data) {
        // Toggle selected state
        interactiveNodes.forEach(n => n.classList.remove('inspected'));
        node.classList.add('inspected');

        // Populate Panel Details
        document.getElementById('panel-title').innerText = data.title;
        document.getElementById('panel-tag').innerText = data.tag;
        document.getElementById('panel-desc').innerText = data.desc;
        document.getElementById('panel-code').innerText = data.code;

        // Display panel content
        panelEmptyState.classList.add('hidden');
        panelContent.classList.remove('hidden');
      }
    });
  });

  function resetArchitectureInspector() {
    interactiveNodes.forEach(n => n.classList.remove('inspected'));
    panelEmptyState.classList.remove('hidden');
    panelContent.classList.add('hidden');
  }

  // ==========================================================================
  // 6. TROUBLESHOOTING ACCORDION
  // ==========================================================================
  const accordionTriggers = document.querySelectorAll('.error-trigger');

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.error-item');
      const details = item.querySelector('.error-details');
      const isOpen = item.classList.contains('open');

      // Close all items first (uncomment if you want one-at-a-time functionality)
      document.querySelectorAll('.error-item').forEach(errItem => {
        errItem.classList.remove('open');
        errItem.querySelector('.error-details').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        // Set height using scrollHeight to enable smooth transition
        details.style.maxHeight = `${details.scrollHeight}px`;
      }
    });
  });

  // ==========================================================================
  // 7. SEARCH FILTER FOR TROUBLESHOOTER
  // ==========================================================================
  const searchInput = document.getElementById('errorSearch');
  const errorItems = document.querySelectorAll('.error-item');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();

    errorItems.forEach(item => {
      const tags = item.getAttribute('data-tags').toLowerCase();
      const title = item.querySelector('h3').innerText.toLowerCase();
      
      if (tags.includes(query) || title.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
        // Close if hidden
        item.classList.remove('open');
        item.querySelector('.error-details').style.maxHeight = null;
      }
    });
  });

});
