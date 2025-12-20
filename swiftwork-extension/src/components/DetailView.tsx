import React, { useEffect, useState } from 'react';
import Header from './Header';
import { PAGE_TOPIC_MAP } from '../utils/topics';
import { Topic } from '../types';
import { highlightElement } from '../utils/highlighter';
import TopicCard from './TopicCard';

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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
    if (topic?.selector) {
      highlightElement(topic.selector);
    }
  }, [topic]);

  const isCorrectPage = (t: Topic): boolean => {
    const path = window.location.pathname;

    // 1. ถ้าอยู่หน้าที่มีการระบุเฉพาะ (เช่น /product/searchable-info)
    if (PAGE_TOPIC_MAP[path]) {
      return PAGE_TOPIC_MAP[path] === t.name;
    }

    // 2. ถ้าอยู่หน้าทั่วไป (เช่น /product/basic-info)
    // ต้องเช็คว่า Topic นี้เป็น Topic ที่ต้องไปหน้าเฉพาะหรือไม่
    const restrictedTopics = Object.values(PAGE_TOPIC_MAP);
    if (restrictedTopics.includes(t.name)) {
      return false;
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

  // Special view for "Searchable Info"
  if (topic.name === "เพิ่มการมองเห็นของการ์ดงาน") {
    const descriptionTopic: Topic = {
      ...topic,
      name: "คำอธิบาย",
      emoji: "📝",
      status: formData?.description ? 'suggest' : 'fail',
      score: 0, // Placeholder
      selector: 'textarea[name="description"]'
    };

    const tagsTopic: Topic = {
      ...topic,
      name: "Tags",
      emoji: "🏷️",
      status: formData?.tags && formData.tags.length > 0 ? 'suggest' : 'fail',
      score: 0, // Placeholder
      // Try to target the visible container for React Select or the input itself
      selector: '#searchable-info-form .css-19bb58m, .css-1rhbuit-multiValue, .css-1g6gooi, input[name="tags"], div[class*="select__control"]'
    };

    const toggleExpand = (cardName: string) => {
      setExpandedCard(expandedCard === cardName ? null : cardName);
    };

    const handleCardClick = (subTopic: Topic, cardName: string) => {
      toggleExpand(cardName);
      if (subTopic.selector) {
        highlightElement(subTopic.selector);
      }
    };

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

          <TopicCard
            topic={descriptionTopic}
            onClick={() => handleCardClick(descriptionTopic, 'description')}
            isExpanded={expandedCard === 'description'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {descriptionTopic.status === 'fail' ? (
              <FailContent topic={descriptionTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={descriptionTopic}
                currentValue={formData?.description || '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          <TopicCard
            topic={tagsTopic}
            onClick={() => handleCardClick(tagsTopic, 'tags')}
            isExpanded={expandedCard === 'tags'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {tagsTopic.status === 'fail' ? (
              <FailContent topic={tagsTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={tagsTopic}
                currentValue={formData?.tags?.join(', ') || '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          {/* Suggestion Section */}
          <div style={{ ...infoBoxStyle, background: '#fff4e5', marginTop: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff9800', marginBottom: '8px' }}>
              💡 คำแนะนำ:
            </div>
            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
              {topic.details?.suggestion || 'ควรใส่คำค้นหาที่เกี่ยวข้องเพื่อให้ลูกค้าหาเจอได้ง่ายขึ้น'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Special view for "Package Info"
  if (topic.name === "ข้อมูลแพ็กเกจ") {
    const priceTopic: Topic = {
      ...topic,
      name: "ราคาเริ่มต้น",
      emoji: "💲",
      status: formData?.price ? 'suggest' : 'fail',
      score: 0,
      selector: 'input[name="price"]'
    };

    const durationTopic: Topic = {
      ...topic,
      name: "ระยะเวลาในการทำงาน",
      emoji: "⏱️",
      status: formData?.duration && parseInt(formData.duration) > 0 ? 'suggest' : 'fail',
      score: 0,
      selector: 'input[name="delivery_times"], input[placeholder*="ระยะเวลา"]'
    };

    const toggleExpand = (cardName: string) => {
      setExpandedCard(expandedCard === cardName ? null : cardName);
    };

    const handleCardClick = (subTopic: Topic, cardName: string) => {
      toggleExpand(cardName);
      if (subTopic.selector) {
        highlightElement(subTopic.selector);
      }
    };

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

          {formData?.packageName && (
            <div style={{
              marginBottom: '12px',
              padding: '8px 12px',
              background: '#e3f2fd',
              borderRadius: '8px',
              color: '#0277bd',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📦</span>
              <span>แพ็กเกจ: {formData.packageName}</span>
            </div>
          )}

          <TopicCard
            topic={priceTopic}
            onClick={() => handleCardClick(priceTopic, 'price')}
            isExpanded={expandedCard === 'price'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {priceTopic.status === 'fail' ? (
              <FailContent topic={priceTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={priceTopic}
                currentValue={formData?.price ? `${formData.price} บาท` : '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          <TopicCard
            topic={durationTopic}
            onClick={() => handleCardClick(durationTopic, 'duration')}
            isExpanded={expandedCard === 'duration'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {durationTopic.status === 'fail' ? (
              <FailContent topic={durationTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={durationTopic}
                currentValue={formData?.duration ? `${formData.duration} วัน` : '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          {/* Suggestion Section */}
          <div style={{ ...infoBoxStyle, background: '#fff4e5', marginTop: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff9800', marginBottom: '8px' }}>
              💡 คำแนะนำ:
            </div>
            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
              {topic.details?.suggestion || 'ควรระบุรายละเอียดแพ็กเกจให้ครบถ้วนเพื่อความชัดเจน'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Special view for "Portfolio Info"
  if (topic.name === "อัลบั้มผลงาน") {
    const albumTopic: Topic = {
      ...topic,
      name: "อัลบั้มผลงาน",
      emoji: "🖼️",
      status: formData?.album_images && formData.album_images.length > 0 ? 'suggest' : 'fail',
      score: 0,
      // Target the upload area or gallery container
      selector: '#__next .Style_card-content__A9xM_, div[class*="gallery"], .album-item, div[class*="upload"], input[type="file"]'
    };

    const videoTopic: Topic = {
      ...topic,
      name: "วิดีโอผลงาน",
      emoji: "🎥",
      status: formData?.video ? 'suggest' : 'fail',
      score: 0,
      // Target video input container or input itself
      selector: 'input[type="url"], #__next .trb-input, input[name="video_url"], input[name="video"], input[placeholder*="YouTube"], input[placeholder*="Link"]'
    };

    const toggleExpand = (cardName: string) => {
      setExpandedCard(expandedCard === cardName ? null : cardName);
    };

    const handleCardClick = (subTopic: Topic, cardName: string) => {
      toggleExpand(cardName);
      if (subTopic.selector) {
        highlightElement(subTopic.selector);
      }
    };

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

          <TopicCard
            topic={albumTopic}
            onClick={() => handleCardClick(albumTopic, 'album')}
            isExpanded={expandedCard === 'album'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {albumTopic.status === 'fail' ? (
              <FailContent topic={albumTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={albumTopic}
                currentValue={formData?.album_images ? `${formData.album_images.length} รูป` : '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          <TopicCard
            topic={videoTopic}
            onClick={() => handleCardClick(videoTopic, 'video')}
            isExpanded={expandedCard === 'video'}
            showArrow
            style={{ marginBottom: '8px' }}
          >
            {videoTopic.status === 'fail' ? (
              <FailContent topic={videoTopic} onRegenerate={() => onRegenerate(topic.name)} />
            ) : (
              <SuggestContent
                topic={videoTopic}
                currentValue={formData?.video ? 'มีวิดีโอแล้ว' : '-'}
                onApply={handleApplySuggestion}
                onRegenerate={() => onRegenerate(topic.name)}
              />
            )}
          </TopicCard>

          {/* Suggestion Section */}
          <div style={{ ...infoBoxStyle, background: '#fff4e5', marginTop: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff9800', marginBottom: '8px' }}>
              💡 คำแนะนำ:
            </div>
            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
              {topic.details?.suggestion || 'การมีรูปภาพและวิดีโอประกอบจะช่วยเพิ่มความน่าเชื่อถือ'}
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

        {displayStatus === 'pass' && <PassContent topic={topic} onRegenerate={() => onRegenerate(topic.name)} />}
        {displayStatus === 'suggest' && (
          <SuggestContent
            topic={topic}
            currentValue={getCurrentValue(topic.name)}
            onApply={handleApplySuggestion}
            onRegenerate={() => onRegenerate(topic.name)}
          />
        )}
        {displayStatus === 'fail' && <FailContent topic={topic} onRegenerate={() => onRegenerate(topic.name)} />}
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

const PassContent: React.FC<{ topic: Topic; onRegenerate: () => void }> = ({ topic, onRegenerate }) => (
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
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
      <button onClick={onRegenerate} style={{ ...buttonStyle, background: '#035db9' }}>
        วิเคราะห์ใหม่
      </button>
    </div>
  </>
);

const SuggestContent: React.FC<{ topic: Topic; currentValue: string; onApply?: () => void; onRegenerate: () => void }> = ({ topic, currentValue, onApply, onRegenerate }) => (
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
    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
      {onApply && (
        <button onClick={onApply} style={{ ...buttonStyle, background: '#FF9F00', flex: 1 }}>
          ใช้คำแนะนำนี้
        </button>
      )}
      <button onClick={onRegenerate} style={{ ...buttonStyle, background: '#035DB9', flex: 1 }}>
        วิเคราะห์ใหม่
      </button>
    </div>
  </>
);

const FailContent: React.FC<{ topic: Topic; onRegenerate: () => void }> = ({ topic, onRegenerate }) => (
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
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
      <button onClick={onRegenerate} style={{ ...buttonStyle, background: '#035db9' }}>
        วิเคราะห์ใหม่
      </button>
    </div>
  </>
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