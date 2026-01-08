import React, { useState } from 'react';
import { Topic } from '../types';

interface TopicCardProps {
    topic: Topic;
    onClick: () => void;
    isExpanded?: boolean;
    showArrow?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick, isExpanded, showArrow, children, style }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusIcon = (status: string) => {
        const iconStyle: React.CSSProperties = {
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            color: 'white',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };

        if (status === 'pass') {
            return <div style={{ ...iconStyle, background: '#00BF63' }}>✔</div>;
        }
        if (status === 'suggest') {
            return <div style={{ ...iconStyle, background: '#F9D746' }}>!</div>;
        }
        if (status === 'fail') {
            return <div style={{ ...iconStyle, background: '#F25849' }}>✖</div>;
        }
        return null;
    };

    return (
    <div
      style={{
        background: 'white',
        padding: '12px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {/* Header */}
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{topic.emoji}</span>
          <span>{topic.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>{topic.score}</span>
          {getStatusIcon(topic.status)}
          {showArrow && (
            <div
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                fontSize: '12px',
                color: '#666',
                marginLeft: '4px'
              }}
            >
              ▼
            </div>
          )}
        </div>
      </div>

      {/* Expand content */}
      {isExpanded && children && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #eee'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};      

export default TopicCard;