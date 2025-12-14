export function createHighlightElements() {
    // Dimmer overlay
    if (!document.getElementById('swiftwork-dimmer-overlay')) {
        const dimmer = document.createElement('div');
        dimmer.id = 'swiftwork-dimmer-overlay';
        dimmer.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 2147483645;
        display: none;
        pointer-events: none;
        transition: opacity 0.3s ease;
      `;
        document.body.appendChild(dimmer);
    }

    // Highlight box
    if (!document.getElementById('swiftwork-highlighter-box')) {
        const highlighter = document.createElement('div');
        highlighter.id = 'swiftwork-highlighter-box';
        highlighter.style.cssText = `
        position: fixed;
        z-index: 2147483646;
        display: none;
        pointer-events: none;
        border: 3px solid #035db9;
        border-radius: 10px;
        box-shadow: 0 0 12px rgba(3, 93, 185, 0.6);
        background: transparent;
        transition: all 0.2s ease;
      `;
        document.body.appendChild(highlighter);
    }
}

export function highlightElement(selector: string) {
    const el = document.querySelector(selector);
    const highlighter = document.getElementById('swiftwork-highlighter-box');
    if (!el || !highlighter) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const padding = 6;
        const top = rect.top - padding;
        const left = rect.left - padding;
        const width = rect.width + padding * 2;
        const height = rect.height + padding * 2;

        highlighter.style.top = `${top}px`;
        highlighter.style.left = `${left}px`;
        highlighter.style.width = `${width}px`;
        highlighter.style.height = `${height}px`;
        highlighter.style.display = 'block';
        highlighter.style.boxShadow = `0 0 0 9999px rgba(0,0,0,0.6)`;

        setTimeout(() => {
            highlighter.style.display = 'none';
        }, 1500);
    }, 400);
}

export function removeHighlight() {
    const highlighter = document.getElementById('swiftwork-highlighter-box');
    if (highlighter) {
        highlighter.style.display = 'none';
    }
}