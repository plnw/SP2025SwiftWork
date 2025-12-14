import React from 'react';
import { FilterType } from '../types';

interface FilterButtonsProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
    const filters: { id: FilterType; label: string; icon: string; color: string }[] = [
        { id: 'all', label: 'All', icon: '≡', color: '#0099ff' },
        { id: 'pass', label: 'Pass score', icon: '✓', color: '#00cc66' },
        { id: 'suggest', label: 'Not pass', icon: '!', color: '#ffcc00' },
        { id: 'fail', label: 'Incomplete', icon: '✕', color: '#ff4d4d' }
    ];

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateX(-10px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    .sw-filter-btn {
                        width: auto !important;
                        min-width: 40px !important;
                        height: 40px !important;
                        padding: 0 12px !important;
                        border-radius: 20px !important;
                        border: none !important;
                        font-size: 18px !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        transition: all 0.3s ease !important;
                        font-family: 'Kanit', sans-serif !important;
                        box-sizing: border-box !important;
                        margin: 0 !important;
                        line-height: normal !important;
                        text-transform: none !important;
                        outline: none !important;
                    }
                    .sw-filter-label {
                        font-size: 14px !important;
                        margin-left: 8px !important;
                        font-weight: 500 !important;
                        white-space: nowrap !important;
                        display: inline-block !important;
                        color: white !important;
                    }
                `}
            </style>
            <div className="sw-filters" style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'flex-start' }}>
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => onFilterChange(f.id)}
                        className={`sw-filter-btn ${currentFilter === f.id ? 'active' : ''}`}
                        style={{
                            backgroundColor: f.color,
                            color: 'white',
                            boxShadow: currentFilter === f.id ? 'inset 0 0 0 2px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {f.icon}
                        {currentFilter === f.id && (
                            <span className="sw-filter-label" style={{ animation: 'fadeIn 0.3s ease-in' }}>
                                {f.label}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </>
    );
};

export default FilterButtons;