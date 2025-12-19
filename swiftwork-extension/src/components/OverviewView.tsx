import React from 'react';
import Header from './Header';
import FilterButtons from './FilterButtons';
import TopicCard from './TopicCard';
import { FilterType, Topic } from '../types';

interface OverviewViewProps {
  topics: Topic[];
  overallScore: number;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onTopicSelect: (index: number) => void;
  onClose: () => void;
  onCollapse: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const OverviewView: React.FC<OverviewViewProps> = ({
  topics,
  overallScore,
  currentFilter,
  onFilterChange,
  onTopicSelect,
  onClose,
  onCollapse,
  onRegenerate,
  isLoading
}) => {
  const visibleTopics = currentFilter === 'all' 
    ? topics 
    : topics.filter(t => t.status === currentFilter);

  const circumference = 2 * Math.PI * 15.9155;

  return (
    <>
      <Header onClose={onClose} onCollapse={onCollapse} />

      {/* Score Section */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#e6f0ff',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#035db9' }}>
            ยกระดับประกาศงานของคุณ!
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
            ปรับปรุงประกาศของคุณให้ดียิ่งขึ้น เพื่อดึงดูดลูกค้าและเพิ่มโอกาสในการขายมากกว่าเดิม
          </div>
        </div>
        <div style={{ width: '80px', height: '80px', position: 'relative' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
          {/* background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#ddd"
            strokeWidth="3.5"
          />

          {/* progress circle */}
          {overallScore > 0 && (
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#ffb74d"
              strokeWidth="3.5"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={circumference * (1 - overallScore / 100)}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          )}
        </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>🔥</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{overallScore}</div>
            <div style={{ fontSize: '10px', color: '#555' }}>คะแนน</div>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <FilterButtons currentFilter={currentFilter} onFilterChange={onFilterChange} />

      {/* Topic Cards */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>กำลังวิเคราะห์...</div>
          </div>
        ) : visibleTopics.length > 0 ? (
          visibleTopics.map((topic) => {
            const actualIndex = topics.findIndex(t => t.name === topic.name);
            return (
              <TopicCard
                key={topic.name}
                topic={topic}
                onClick={() => onTopicSelect(actualIndex)}
              />
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            ไม่พบหัวข้อที่ตรงกับตัวกรอง
          </div>
        )}
      </section>

      {/* Tips Section */}
      {currentFilter === 'all' && (
        <section
          style={{
            background: '#fff4e5',
            padding: '12px',
            borderRadius: '12px',
            marginTop: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#ff9800', marginBottom: '6px' }}>
            💡 คำแนะนำ
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            ควรได้อย่างน้อย <b>80</b> คะแนนในแต่ละหมวด เพื่อเพิ่มคะแนนรวมของประกาศ
            แนะนำให้ปรับปรุงหมวดที่ได้คะแนนต่ำก่อน
          </div>
        </section>
      )}

      {/* Regenerate Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          style={{
            background: isLoading ? '#ccc' : '#035db9',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '15px'
          }}
        >
          {isLoading ? '⏳ กำลังวิเคราะห์...' : '🔧 วิเคราะห์ใหม่'}
        </button>
      </div>
    </>
  );
};

export default OverviewView;