import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentScript from './ContentScript';

const SIDEBAR_ROOT_ID = 'swiftwork-sidebar-root';
const SIDEBAR_WIDTH = 380;

function injectSidebar() {
    // ตรวจสอบว่ามี sidebar อยู่แล้วหรือไม่
    if (document.getElementById(SIDEBAR_ROOT_ID)) {
        console.log('SwiftWork Sidebar already exists');
        return;
    }

    console.log('Injecting SwiftWork Sidebar...');

    // สร้าง root container
    const root = document.createElement('div');
    root.id = SIDEBAR_ROOT_ID;
    root.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: ${SIDEBAR_WIDTH}px;
    z-index: 2147483647;
  `;
    document.body.appendChild(root);

    // Render React app
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
        <React.StrictMode>
            <ContentScript />
        </React.StrictMode>
    );

    console.log('SwiftWork Sidebar injected successfully ✅');
}

function removeSidebar() {
    const sidebarRoot = document.getElementById(SIDEBAR_ROOT_ID);
    const backdrop = document.getElementById('swiftwork-backdrop');
    const container = document.querySelector('#__next') || document.querySelector('main') || document.body;

    if (sidebarRoot) {
        sidebarRoot.remove();
        console.log('SwiftWork Sidebar removed');
    }
    if (backdrop) {
        backdrop.remove();
    }
    (container as HTMLElement).style.marginRight = '';
}

// Auto-inject sidebar when content script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSidebar);
} else {
    injectSidebar();
}

// Listen to messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Message received:', message);

    if (message.action === 'toggleSidebar') {
        const existingSidebar = document.getElementById(SIDEBAR_ROOT_ID);
        if (existingSidebar) {
            removeSidebar();
        } else {
            injectSidebar();
        }
        sendResponse({ success: true });
    }

    if (message.action === 'analyzeProduct') {
        // Forward to backend or handle locally
        sendResponse({ success: true, data: {} });
    }

    return true; // Keep message channel open for async response
});