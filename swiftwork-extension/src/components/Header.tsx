import React from 'react';

interface HeaderProps {
    onClose: () => void;
    onCollapse: () => void;
    showBack?: boolean;
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClose, onCollapse, showBack, onBack }) => {
    return (
        <header style={{ marginBottom: '8px', height: '50px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#035db9',
                    padding: '0 12px',
                    borderRadius: '8px',
                    color: 'white',
                    height: '100%'
                }}
            >
                {showBack && onBack ? (
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>‹</span> ย้อนกลับ
                    </button>
                ) : (
                    <img
                        src={chrome.runtime.getURL('icons/Swiftwork-header.png')}
                        alt="SwiftWork"
                        style={{ height: '24px', objectFit: 'contain' }}
                    />
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onCollapse}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '35px',
                            cursor: 'pointer',
                            marginTop: '-6px'
                        }}
                    >
                        -
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }}
                    >
                        ✖
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;