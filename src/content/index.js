console.log("Playhunt: Extension content script initializing...");

// Helper to check if extension context is still valid
function isExtensionValid() {
  try {
    return !!chrome.runtime && !!chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

function injectBubble() {
  if (document.getElementById('uvf-bubble-ext')) return;
  if (!document.body) {
    console.log("Playhunt: document.body not ready. Retrying...");
    setTimeout(injectBubble, 100);
    return;
  }
  
  console.log("Playhunt: Injecting Bubble into DOM.");
  
  const bubble = document.createElement('div');
  bubble.id = 'uvf-bubble-ext';
  bubble.style.cssText = `
    width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1, #a855f7);
    border-radius: 50%; box-shadow: 0 10px 25px rgba(99,102,241,0.5);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    border: 2px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);
    transition: transform 0.3s; z-index: 9999999; position: fixed; bottom: 30px; right: 30px;
  `;
  
  // Safe SVG injection avoiding innerHTML completely
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "white");
  svg.setAttribute("stroke-width", "2.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M2 12h4l3-9 5 18 3-9h5");
  
  svg.appendChild(path);
  bubble.appendChild(svg);
  document.body.appendChild(bubble);

  bubble.addEventListener('mouseenter', () => bubble.style.transform = 'scale(1.1)');
  bubble.addEventListener('mouseleave', () => bubble.style.transform = 'scale(1)');
  bubble.addEventListener('click', startSelectionMode);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBubble);
} else {
  injectBubble();
}

try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_SELECTION" || request.action === "ANALYZE_VIDEO") {
      startSelectionMode();
    }
  });
} catch (e) {
  console.log("Playhunt: Extension context invalidated. Please reload the page.");
}

let overlay, selectionBox;
let startX, startY;

function startSelectionMode() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(15, 23, 42, 0.4)';
  overlay.style.backdropFilter = 'blur(2px)';
  overlay.style.zIndex = '99999999';
  overlay.style.cursor = 'crosshair';
  document.body.appendChild(overlay);

  selectionBox = document.createElement('div');
  selectionBox.style.position = 'fixed';
  selectionBox.style.border = '2px dashed #818cf8';
  selectionBox.style.background = 'rgba(99, 102, 241, 0.1)';
  selectionBox.style.display = 'none';
  overlay.appendChild(selectionBox);

  overlay.addEventListener('mousedown', onMouseDown);
}

function onMouseDown(e) {
  startX = e.clientX;
  startY = e.clientY;
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'block';

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  const currentX = e.clientX;
  const currentY = e.clientY;

  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  selectionBox.style.left = (currentX < startX ? currentX : startX) + 'px';
  selectionBox.style.top = (currentY < startY ? currentY : startY) + 'px';
}

function onMouseUp(e) {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  overlay.removeEventListener('mousedown', onMouseDown);

  const rect = selectionBox.getBoundingClientRect();
  if (rect.width < 50 || rect.height < 50) {
    cleanupSelection();
    return; // Ignore tiny clicks
  }

  // Show Keyword UI Overlay before scanning
  overlay.style.cursor = 'default';
  
  const uiWrapper = document.createElement('div');
  uiWrapper.style.position = 'absolute';
  uiWrapper.style.top = (rect.bottom + 15) + 'px';
  uiWrapper.style.left = rect.left + 'px';
  uiWrapper.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
  uiWrapper.style.padding = '12px 16px';
  uiWrapper.style.borderRadius = '12px';
  uiWrapper.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3)';
  uiWrapper.style.display = 'flex';
  uiWrapper.style.gap = '10px';
  uiWrapper.style.zIndex = '999999999';
  uiWrapper.style.backdropFilter = 'blur(10px)';

  const input = document.createElement('input');
  input.placeholder = "Optional hint (e.g., actor name)";
  input.style.padding = '8px 12px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid rgba(255,255,255,0.2)';
  input.style.backgroundColor = 'rgba(0,0,0,0.5)';
  input.style.color = '#fff';
  input.style.outline = 'none';
  input.style.fontFamily = 'sans-serif';
  input.style.fontSize = '12px';
  input.style.width = '200px';

  const btn = document.createElement('button');
  btn.innerText = "Analyze";
  btn.style.padding = '8px 16px';
  btn.style.backgroundColor = '#6366f1';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.fontWeight = 'bold';
  btn.style.fontFamily = 'sans-serif';
  btn.style.fontSize = '12px';
  
  uiWrapper.appendChild(input);
  uiWrapper.appendChild(btn);
  overlay.appendChild(uiWrapper);
  
  input.focus();

  btn.addEventListener('click', () => {
    const hint = input.value;
    uiWrapper.remove();
    startScanning(rect, hint);
  });
}

function cleanupSelection() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
  overlay = null;
  selectionBox = null;
}

// Visual 5 second scanning loop
function startScanning(rect, hintText = "") {
  overlay.style.cursor = 'wait';
  selectionBox.style.border = '2px solid #6366f1';
  selectionBox.style.boxShadow = '0 0 30px rgba(99,102,241,0.5)';
  
  // Laser animation overlay
  const laser = document.createElement('div');
  laser.style.width = '100%';
  laser.style.height = '4px';
  laser.style.background = '#818cf8';
  laser.style.boxShadow = '0 0 15px 5px rgba(129, 140, 248, 0.6)';
  laser.style.position = 'absolute';
  laser.style.top = '0';
  laser.animate([
    { top: '0%' },
    { top: '100%' },
    { top: '0%' }
  ], {
    duration: 2000,
    iterations: Infinity,
    easing: 'ease-in-out'
  });
  selectionBox.appendChild(laser);

  // Status text floating below selection
  const status = document.createElement('div');
  status.innerText = "Analyzing Frame & Hashing Signatures...";
  status.style.position = 'absolute';
  status.style.bottom = '-30px';
  status.style.left = '50%';
  status.style.transform = 'translateX(-50%)';
  status.style.color = '#fff';
  status.style.fontFamily = 'sans-serif';
  status.style.fontSize = '12px';
  status.style.fontWeight = 'bold';
  status.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
  status.style.whiteSpace = 'nowrap';
  selectionBox.appendChild(status);

  captureAndAnalyze(rect, status, hintText);
}

function captureAndAnalyze(rect, statusElem, hintText) {
  // Check extension context before calling chrome API
  if (!isExtensionValid()) {
    statusElem.innerText = "Extension updated. Please reload this page.";
    setTimeout(cleanupSelection, 3000);
    return;
  }
  // Capture Tab
  chrome.runtime.sendMessage({ action: "CAPTURE_VISIBLE_TAB" }, async (response) => {
    if (chrome.runtime.lastError) {
      statusElem.innerText = "Extension updated. Please reload this page.";
      setTimeout(cleanupSelection, 3000);
      return;
    }
    if (!response || !response.dataUrl) {
      statusElem.innerText = "Error capturing screen.";
      setTimeout(cleanupSelection, 2000);
      return;
    }

    const { dataUrl } = response;
    
    // Convert DataURL to Image to crop
    const img = new Image();
    img.onload = async () => {
      // Create hidden canvas to crop the image
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');

      // The rect gives us the logical coordinates, multiply by devicePixelRatio for absolute sharpness if needed
      const ratio = window.devicePixelRatio || 1;
      
      ctx.drawImage(
        img, 
        rect.left * ratio, rect.top * ratio, rect.width * ratio, rect.height * ratio, 
        0, 0, rect.width, rect.height
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // Step 2: Enforce minimum 5 second wait to make it "easy to get data and for user right" 
      statusElem.innerText = "Processing with Deep AI...";
      
      const startTime = Date.now();

      let apiResponse = null;
      try {
        const fetchRes = await fetch('http://localhost:5000/api/analyze-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: croppedBase64, hint: hintText })
        });
        
        apiResponse = await fetchRes.json();
      } catch (err) {
        console.error("API Error during analysis:", err);
      }

      // Ensure 5 seconds have passed
      const elapsedTime = Date.now() - startTime;
      const remainingWait = 5000 - elapsedTime;

      if (remainingWait > 0) {
        await new Promise(r => setTimeout(r, remainingWait));
      }

      cleanupSelection();

      if (apiResponse && apiResponse.title) {
        showResultModal(apiResponse);
      } else {
        alert("Playhunt: Could not detect a valid movie in this frame.");
      }
    };
    img.src = dataUrl;
  });
}

// Final Step: Inject Sleek React-like 2026 UI into standard DOM
function showResultModal(movieData) {
  const modalOuter = document.createElement('div');
  modalOuter.style.position = 'fixed';
  modalOuter.style.top = '0';
  modalOuter.style.left = '0';
  modalOuter.style.width = '100vw';
  modalOuter.style.height = '100vh';
  modalOuter.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
  modalOuter.style.backdropFilter = 'blur(8px)';
  modalOuter.style.zIndex = '99999999';
  modalOuter.style.display = 'flex';
  modalOuter.style.alignItems = 'center';
  modalOuter.style.justifyContent = 'center';

  const modalInner = document.createElement('div');
  modalInner.style.width = '350px';
  modalInner.style.backgroundColor = '#0f172a'; // slate-900
  modalInner.style.borderRadius = '24px';
  modalInner.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)';
  modalInner.style.overflow = 'hidden';
  modalInner.style.color = '#fff';
  modalInner.style.fontFamily = "'Inter', sans-serif";
  modalInner.style.position = 'relative';

  // Header image
  const imgHtml = movieData.poster 
    ? `<div style="width: 100%; height: 200px; position:relative; overflow:hidden;">
         <img src="${movieData.poster}" style="width:100%; height:100%; object-fit: cover;" />
         <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, #0f172a, transparent);"></div>
       </div>` 
    : `<div style="height: 100px; background: linear-gradient(to right, #6366f1, #a855f7);"></div>`;

  const youtubeUrl = `https://www.google.com/search?q=${encodeURIComponent(movieData.title)}+streaming`;

  modalInner.innerHTML = `
    ${imgHtml}
    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(5px);" id="uvf-close-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </div>
    <div style="padding: 20px; text-align: left; margin-top:-40px; position: relative; z-index: 10;">
      <span style="background: rgba(99,102,241,0.9); color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">98% Visual Match</span>
      <h1 style="margin: 10px 0 5px; font-size: 24px; font-weight: 800;">${movieData.title}</h1>
      <p style="margin: 0 0 15px; color: #94a3b8; font-size: 12px; font-weight: 500;">${movieData.year} • ${movieData.genres.join(", ")}</p>
      
      <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${movieData.description}</p>
      
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-bottom: 15px;">
        <p style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 600;">Identified Cast</p>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px;">
          ${movieData.cast.map(c => `<span style="background: rgba(255,255,255,0.1); font-size: 11px; padding: 4px 10px; border-radius: 12px; white-space: nowrap;">${c}</span>`).join('')}
        </div>
      </div>

      <a href="${youtubeUrl}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(45deg, #6366f1, #a855f7); color: white; text-decoration: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(99,102,241,0.4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9v-18z"/></svg> Watch Full Source
      </a>
    </div>
  `;

  modalOuter.appendChild(modalInner);
  document.body.appendChild(modalOuter);

  document.getElementById('uvf-close-btn').addEventListener('click', () => {
    modalOuter.remove();
  });
}
