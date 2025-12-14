// Background script for Chrome Extension
// Handles icon clicks and message passing

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
    }
});

// Listen to messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'analyzeProduct') {
        // Mock response - ในอนาคตจะเชื่อมต่อกับ FastAPI
        const data = message.payload;
        const response = {
            scores: {
                title: data.title ? 90 : 0,
                description: data.description ? 85 : 0,
                price: data.price ? 'OK' : 'Missing'
            },
            suggestions: [
                'เพิ่ม keyword "freelance"',
                'ปรับราคาสมเหตุสมผล'
            ]
        };
        sendResponse(response);
    }
    return true;
});