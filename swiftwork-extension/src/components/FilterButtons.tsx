import React, { useState } from 'react';
import { FILTERS } from '../utils/topics';
import { FilterType } from '../types';

interface FilterButtonsProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
    const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null);

    return (
        <div
            style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-start',
                marginBottom: '16px',
                paddingLeft: '12px'
            }}
        >
            {FILTERS.map(filter => {
                const isActive = filter.key === currentFilter;
                const isHovered = filter.key === hoveredFilter;

                return (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        onMouseEnter={() => setHoveredFilter(filter.key)}
                        onMouseLeave={() => setHoveredFilter(null)}
                        title={filter.key.toUpperCase()}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: filter.color,
                            color: 'white',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive
                                ? `0 0 6px rgba(0,0,0,0.20), 0 0 0 3px ${filter.color}`
                                : 'none',
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                        }}
                    >
                        {filter.icon}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterButtons;