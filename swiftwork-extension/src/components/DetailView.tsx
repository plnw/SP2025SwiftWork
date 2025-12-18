import React, { useEffect } from 'react';
import Header from './Header';
import { PAGE_TOPIC_MAP } from '../utils/topics';
import { Topic } from '../types';
import { highlightElement } from '../utils/highlighter';

interface DetailViewProps {
  topicIndex: number;
  topics: Topic[];
  hasAnalyzed: boolean;
  formData: any;
  onBack: () => void;
  onClose: () => void;
  onCollapse: () => void;
  onNavigate: (index: number) => void;
  onRegenerate: (topicName: string) => void; 
}

const DetailView: React.FC<DetailViewProps> = ({
  topicIndex,
  topics,
  hasAnalyzed,
  formData,
  onBack,
  onClose,
  onCollapse,
  onNavigate,
  onRegenerate
}) => {
  const topic = topics[topicIndex];

  const getCurrentValue = (topicName: string) => {
    if (!formData) return 'N/A';

    switch (topicName) {
      case 'ชื่องาน':
        return formData.title || 'N/A';
      case 'หมวดหมู่':
        return formData.category || 'N/A';
      case 'ราคาเริ่มต้น':
        return formData.price || 'N/A';
      default:
        return 'N/A';
    }
  };

  const displayStatus: Topic['status'] = hasAnalyzed
    ? topic.status
    : 'fail';

  useEffect(() => {
    if (topic?.selector && isCorrectPage(topic)) {
      highlightElement(topic.selector);
    }
  }, [topic]);

  const isCorrectPage = (t: Topic): boolean => {
    const path = window.location.pathname;

    if (PAGE_TOPIC_MAP[path]) {
      return PAGE_TOPIC_MAP[path] === t.name;
    }

    return true;
  };


  const handlePrev = () => {
    const newIndex = (topicIndex - 1 + topics.length) % topics.length;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = (topicIndex + 1) % topics.length;
    onNavigate(newIndex);
  };

  const handleApplySuggestion = () => {
    if (!topic.selector || !topic.details?.aiFix) {
      alert("ไม่พบตำแหน่งช่องกรอกหรือไม่มีคำแนะนำจาก AI");
      return;
    }

    const inputEl = document.querySelector(topic.selector);
    if (inputEl) {
      const realInput = inputEl.querySelector("input, textarea") || inputEl;
      (realInput as HTMLInputElement).value = topic.details.aiFix;
      realInput.dispatchEvent(new Event("input", { bubbles: true }));
      (realInput as HTMLElement).style.backgroundColor = "#e3f2fd";
      (realInput as HTMLElement).style.transition = "background-color 0.3s ease";
    }
  };

  const getStatusIconAndColor = (status: string) => {
    if (status === 'fail') return { icon: '✖', color: '#F25849' };
    if (status === 'suggest') return { icon: '!', color: '#F9D746' };
    return { icon: '✔', color: '#00BF63' };
  };

  const { icon: statusIconChar, color: statusColor } = getStatusIconAndColor(displayStatus);

  if (!isCorrectPage(topic)) {
    return (
      <>
        <Header onClose={onClose} onCollapse={onCollapse} showBack onBack={onBack} />
        <div style={{ background: '#F7F9FC', padding: '16px' }}>
          <TopicHeader
            topic={topic}
            statusIconChar="⚠️"
            statusColor="#ff9800"
            onPrev={handlePrev}
            onNext={handleNext}
            showScore={false}
          />
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
              ไม่สามารถแสดงข้อมูล
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
              หัวข้อ <b>{topic.name}</b> ไม่ได้อยู่ในหน้าที่เกี่ยวข้อง
              กรุณาไปยังหน้าที่ถูกต้องเพื่อดูรายละเอียด
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onClose={onClose} onCollapse={onCollapse} showBack onBack={onBack} />
      <div style={{ background: '#F7F9FC', padding: '16px' }}>
        <TopicHeader
          topic={topic}
          statusIconChar={statusIconChar}
          statusColor={statusColor}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        
        {displayStatus === 'pass' && <PassContent topic={topic} />}
        {displayStatus === 'suggest' && (
          <SuggestContent
            topic={topic}
            currentValue={getCurrentValue(topic.name)}
          />
        )}
        {displayStatus === 'fail' && <FailContent topic={topic} />}

        <ActionButtons status={displayStatus} onApply={handleApplySuggestion} onRegenerate={() => onRegenerate(topic.name)} />
      </div>
    </>
  );
};

// Sub-components
const TopicHeader: React.FC<{
  topic: Topic;
  statusIconChar: string;
  statusColor: string;
  onPrev: () => void;
  onNext: () => void;
  showScore?: boolean;
}> = ({ topic, statusIconChar, statusColor, onPrev, onNext, showScore = true }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#E6F0FF',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    margin: '-16px -16px 16px -16px'
  }}>
    <button onClick={onPrev} style={navButtonStyle}>‹</button>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '40px', lineHeight: 1 }}>{topic.emoji}</div>
      <div style={{ fontSize: '16px', marginTop: '12px' }}>{topic.name}</div>
      {showScore && (
        <div style={{
          fontSize: '13px',
          color: '#6c757d',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'white',
          padding: '4px 10px',
          borderRadius: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          marginTop: '4px'
        }}>
          คะแนน: {topic.score}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: statusColor,
            color: 'white',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {statusIconChar}
          </div>
        </div>
      )}
    </div>
    <button onClick={onNext} style={navButtonStyle}>›</button>
  </div>
);

const PassContent: React.FC<{ topic: Topic }> = ({ topic }) => (
  <>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={statusBadgeStyle('#00BF63')}>✔</div>
      <div style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
        ดีมาก!
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
        {topic.name} ของคุณยอดเยี่ยมและเป็นไปตามแนวทางปฏิบัติที่ดีแล้ว
      </p>
    </div>
    {topic.details?.passTips && (
      <div style={{ ...infoBoxStyle, background: '#fff4e5' }}>
        <div style={{ margin: '0 0 8px 0', color: '#ff9800', fontSize: '14px', fontWeight: 'bold' }}>
          💡 เคล็ดลับเพิ่มเติม:
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
          {topic.details.passTips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>
    )}
  </>
);

const SuggestContent: React.FC<{ topic: Topic; currentValue: string; }> = ({ topic, currentValue}) => (
  <>
    <div style={{ ...infoBoxStyle, background: 'white' }}>
      <div style={{ fontSize: '14px', color: '#888' }}>ปัจจุบัน:</div>
      <div style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>
        {currentValue}
      </div>
    </div>
    <div style={{ ...infoBoxStyle, background: '#E6F0FF' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#035DB9', marginBottom: '8px' }}>
        การวิเคราะห์โดย SwiftWork AI
      </div>
      <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
        {topic.details?.aiAnalysis || 'ไม่มีข้อมูลวิเคราะห์'}
      </p>
    </div>
    <div style={{ ...infoBoxStyle, background: '#fff4e5' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff9800', marginBottom: '8px' }}>
        💡 คำแนะนำ:
      </div>
      <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
        {topic.details?.suggestion || 'ไม่มีคำแนะนำ'}
      </p>
    </div>
    <div style={{ ...infoBoxStyle, background: 'white' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#035DB9', marginBottom: '12px' }}>
        ✨ แก้ไขโดย SwiftWork AI
      </div>
      <div style={{ background: '#E6F0FF', padding: '13px', borderRadius: '8px', fontSize: '13px', color: '#333' }}>
        {topic.details?.aiFix || 'N/A'}
      </div>
    </div>
  </>
);

const FailContent: React.FC<{ topic: Topic }> = ({ topic }) => (
  <>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={statusBadgeStyle('#F25849')}>✖</div>
      <div style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
        ยังไม่มี!
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
        {topic.name} ของคุณยังไม่ได้ใส่ อาจทำให้ไม่ได้รับการมองเห็น
      </p>
    </div>
    <div style={{ ...infoBoxStyle, background: '#ffebee', marginTop: '-10px' }}>
      <div style={{ margin: '0 0 12px 0', color: '#F25849', fontSize: '14px', fontWeight: 'bold' }}>
        🚨 ขั้นตอนถัดไป:
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
        {(topic.details?.fail || ['ไม่มีข้อมูล']).map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  </>
);

const ActionButtons: React.FC<{status: Topic['status']; onApply: () => void; onRegenerate: () => void }> = ({ status, onApply, onRegenerate }) => (
  <div style={{ marginTop: '24px' }}>
    {status === 'suggest' ? (
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onApply} style={{ ...buttonStyle, background: '#FF9F00', flex: 1 }}>
          ใช้คำแนะนำนี้
        </button>
        <button onClick={onRegenerate} style={{ ...buttonStyle, background: '#035DB9', flex: 1 }}>
          วิเคราะห์ใหม่
        </button>
      </div>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onRegenerate} style={{ ...buttonStyle, background: '#035db9' }}>
          วิเคราะห์ใหม่
        </button>
      </div>
    )}
  </div>
);

// Styles
const navButtonStyle: React.CSSProperties = {
  background: '#dce7f9ff',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#495057'
};

const statusBadgeStyle = (bg: string): React.CSSProperties => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: bg,
  color: 'white',
  fontSize: '25px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px'
});

const infoBoxStyle: React.CSSProperties = {
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  marginLeft: '-16px',
  marginRight: '-16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const buttonStyle: React.CSSProperties = {
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 'bold'
};

export default DetailView;