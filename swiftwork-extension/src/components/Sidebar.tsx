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
  const [isLoading, setIsLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(85);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>(
    TOPICS.map(t => ({
      ...t,
      score: 0,
      status: 'fail'
    }))
  );

  const handleURLChange = React.useCallback(() => {
    removeHighlight();
    setCurrentTopicFromURL();
  }, [topics]);

  useEffect(() => {
      createHighlightElements();
      setCurrentTopicFromURL();

      watchFormChanges((formData) => {
        setCurrentFormData(formData);
      });

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

  useEffect(() => {
    if (!hasAnalyzed) return;
    if (currentTopicIndex > -1) return;
    setCurrentTopicFromURL();
  }, [topics, hasAnalyzed]);

  useEffect(() => {
    let lastUrl = window.location.href;

    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('Detected URL change:', currentUrl);
        removeHighlight();
        setCurrentTopicFromURL();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [topics]);

  const setCurrentTopicFromURL = () => {
    const url = window.location.pathname + window.location.search;

    const matchedEntry = Object.entries(PAGE_TOPIC_MAP).find(
      ([pagePath]) => url.includes(pagePath)
    );

    if (matchedEntry) {
      const [, topicName] = matchedEntry;

      const index = topics.findIndex(t => t.name === topicName);

      if (index !== -1) {
        setCurrentTopicIndex(index);
        return;
      }
    }

    setCurrentTopicIndex(-1);
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

  const hasCoverImageInDOM = (): boolean => {
    return Boolean(
      document.querySelector(
        'img[src*="fastwork"], img[src*="cloudfront"], img[src*="storage"]'
      )
    );
  };

  const hasDataForTopic = (topicName: string, formData: any): boolean => {
    switch (topicName) {
      case 'ภาพปกงาน':
        return hasCoverImageInDOM();

      case 'ชื่องาน':
        return Boolean(formData.title?.trim());

      case 'หมวดหมู่':
        return Boolean(formData.category);

      case 'ราคาเริ่มต้น':
        return Boolean(formData.price);

      default:
        return true;
    }
  };


  const FORM_BASED_TOPICS = [
    'ภาพปกงาน',
    'ชื่องาน',
    'หมวดหมู่',
    'ราคาเริ่มต้น'
  ];

  const isFormBasedTopic = (topicName: string) =>
    FORM_BASED_TOPICS.includes(topicName);

  const handleAnalyzeProduct = async (targetTopicName?: string) => {
    setIsLoading(true);
    try {
      const formData = extractFormData();
      setCurrentFormData(formData);
      const result = await analyzeProduct(formData);

      const updatedTopics = topics.map(existingTopic => {
        // วิเคราะห์หัวข้อเดียว
        if (targetTopicName && existingTopic.name !== targetTopicName) {
          return existingTopic;
        }

        // ❗ Analyze All → ข้ามหัวข้อเฉพาะ
        if (!targetTopicName && !isFormBasedTopic(existingTopic.name)) {
          return existingTopic;
        }

        const apiTopic = result.topics.find(
          t => t.name === existingTopic.name
        );

        // ไม่มีข้อมูลจริง → fail
        if (!hasDataForTopic(existingTopic.name, formData)) {
          return {
            ...existingTopic,
            status: 'fail' as Topic['status'],
            score: 0
          };
        }

        if (!apiTopic) {
          return existingTopic;
        }

        return {
          ...existingTopic,
          status: apiTopic.status as Topic['status'],
          score: apiTopic.score,
          selector: existingTopic.selector
        };
      });

      setTopics(updatedTopics);
      setOverallScore(result.overall_score);
      setHasAnalyzed(true); 
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    await handleAnalyzeProduct();
  };

  const handleRegenerateSingle = async (topicName: string) => {
    await handleAnalyzeProduct(topicName);
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
          hasAnalyzed={hasAnalyzed}
          formData={currentFormData} 
          onBack={handleBack}
          onClose={handleClose}
          onCollapse={handleCollapse}
          onNavigate={setCurrentTopicIndex}
          onRegenerate={(topicName) => handleRegenerateSingle(topicName)}
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
          onRegenerate={handleAnalyzeAll}
          isLoading={isLoading}
        />
      )}
    </aside>
  );
};

export default Sidebar;