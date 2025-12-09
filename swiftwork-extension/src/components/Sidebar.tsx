import React, { useState, useEffect } from 'react';
import OverviewView from './OverviewView';
import DetailView from './DetailView';
import { TOPICS, PAGE_TOPIC_MAP } from '../utils/topics';
import { FilterType, Topic } from '../types';
import { createHighlightElements, removeHighlight } from '../utils/highlighter';
import { analyzeProduct } from '../services/api';
import { extractFormData, watchFormChanges } from '../utils/extractFormData';

const SIDEBAR_WIDTH = 380;

const Sidebar: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(-1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  const [isLoading, setIsLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(85);

  useEffect(() => {
    createHighlightElements();
    setCurrentTopicFromURL();

    // เรียก API ครั้งแรกเมื่อโหลด
    handleAnalyzeProduct();

    // Watch form changes
    watchFormChanges((formData) => {
      console.log('Form data changed:', formData);
      // อาจจะเรียก API อีกครั้งหรือรอให้ user กด "วิเคราะห์ใหม่"
    });

    const handleURLChange = () => {
      setCurrentTopicFromURL();
      removeHighlight();
    };

    // Detect URL changes
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function (...args) {
      const result = pushState.apply(this, args);
      handleURLChange();
      return result;
    };

    history.replaceState = function (...args) {
      const result = replaceState.apply(this, args);
      handleURLChange();
      return result;
    };

    window.addEventListener('popstate', handleURLChange);

    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);

  const setCurrentTopicFromURL = () => {
    const path = window.location.pathname;
    const topicName = PAGE_TOPIC_MAP[path];

    if (topicName) {
      const index = TOPICS.findIndex(t => t.name === topicName);
      setCurrentTopicIndex(index);
    } else {
      setCurrentTopicIndex(-1);
    }
  };

  const handleClose = () => {
    const sidebar = document.getElementById('swiftwork-sidebar-root');
    const backdrop = document.getElementById('swiftwork-backdrop');
    const container = document.querySelector('#__next') || document.querySelector('main') || document.body;

    if (sidebar) sidebar.remove();
    if (backdrop) backdrop.remove();
    (container as HTMLElement).style.marginRight = '';
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleBack = () => {
    setCurrentTopicIndex(-1);
  };

  const handleAnalyzeProduct = async () => {
    setIsLoading(true);
    try {
      const formData = extractFormData();
      const result = await analyzeProduct(formData);

      // อัปเดต topics จาก API response
      const updatedTopics = result.topics.map(apiTopic => {
        const existingTopic = TOPICS.find(t => t.name === apiTopic.name);
        return {
          ...existingTopic,
          ...apiTopic,
          selector: existingTopic?.selector
        } as Topic;
      });

      setTopics(updatedTopics);
      setOverallScore(result.overall_score);
      console.log('✅ Analysis completed:', result);
    } catch (error) {
      console.error('❌ Failed to analyze:', error);
      // ถ้า API ล้มเหลว ใช้ข้อมูลเดิม (TOPICS)
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await handleAnalyzeProduct();
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100%',
    width: isCollapsed ? '60px' : `${SIDEBAR_WIDTH}px`,
    background: isCollapsed ? 'transparent' : '#f7f9fc',
    padding: isCollapsed ? 0 : '16px',
    overflowY: isCollapsed ? 'visible' : 'scroll',
    boxSizing: 'border-box',
    zIndex: 2147483647,
    fontFamily: 'Arial, sans-serif',
    boxShadow: isCollapsed ? 'none' : '-3px 0 8px rgba(0,0,0,0.15)',
    borderLeft: isCollapsed ? 'none' : '1px solid #e0e0e0',
    transition: 'all 220ms ease'
  };

  return (
    <aside id="swiftwork-sidebar" style={sidebarStyle}>
      {isCollapsed ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div
            onClick={handleCollapse}
            style={{
              background: '#035db9',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
            title="คลิกเพื่อขยาย"
          >
            <img
              src={chrome.runtime.getURL('icons/Swiftwork-icon.png')}
              style={{ width: '30px', height: '30px' }}
              alt="SwiftWork"
            />
          </div>
        </div>
      ) : currentTopicIndex > -1 ? (
        <DetailView
          topicIndex={currentTopicIndex}
          topics={topics}
          onBack={handleBack}
          onClose={handleClose}
          onCollapse={handleCollapse}
          onNavigate={setCurrentTopicIndex}
          onRegenerate={handleRegenerate}
        />
      ) : (
        <OverviewView
          topics={topics}
          overallScore={overallScore}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onTopicSelect={setCurrentTopicIndex}
          onClose={handleClose}
          onCollapse={handleCollapse}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      )}
    </aside>
  );
};

export default Sidebar;