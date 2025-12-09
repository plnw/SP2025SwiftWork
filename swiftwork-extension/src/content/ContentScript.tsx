import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const SIDEBAR_WIDTH = 380;
const BACKDROP_ID = 'swiftwork-backdrop';

const ContentScript: React.FC = () => {
    useEffect(() => {
        // Setup backdrop และ adjust layout
        setupLayout();

        // Cleanup เมื่อ component unmount
        return () => {
            cleanupLayout();
        };
    }, []);

    const setupLayout = () => {
        const useOverlay = window.innerWidth < 800;

        if (useOverlay) {
            // สร้าง backdrop สำหรับหน้าจอเล็ก
            if (!document.getElementById(BACKDROP_ID)) {
                const backdrop = document.createElement('div');
                backdrop.id = BACKDROP_ID;
                backdrop.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 2147483646;
        `;
                backdrop.addEventListener('click', handleBackdropClick);
                document.body.appendChild(backdrop);
            }
        } else {
            // ปรับ margin ของ main container
            const container = getMainContainer();
            if (container) {
                container.style.transition = 'margin-right 220ms ease';
                container.style.marginRight = SIDEBAR_WIDTH + 'px';
            }
        }
    };

    const cleanupLayout = () => {
        // ลบ backdrop
        const backdrop = document.getElementById(BACKDROP_ID);
        if (backdrop) {
            backdrop.remove();
        }

        // รีเซ็ต margin
        const container = getMainContainer();
        if (container) {
            container.style.marginRight = '';
        }
    };

    const handleBackdropClick = () => {
        const sidebarRoot = document.getElementById('swiftwork-sidebar-root');
        const backdrop = document.getElementById(BACKDROP_ID);

        if (sidebarRoot) sidebarRoot.remove();
        if (backdrop) backdrop.remove();

        const container = getMainContainer();
        if (container) {
            container.style.marginRight = '';
        }
    };

    const getMainContainer = (): HTMLElement | null => {
        return (
            document.querySelector('#__next') ||
            document.querySelector('main') ||
            document.body
        );
    };

    return <Sidebar />;
};

export default ContentScript;