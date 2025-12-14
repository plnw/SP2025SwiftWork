export type TopicStatus = 'pass' | 'suggest' | 'fail';

export interface TopicDetails {
    fail?: string[];
    passTips?: string[];
    current?: string;
    aiAnalysis?: string;
    suggestion?: string;
    aiFix?: string;
}

export interface Topic {
    name: string;
    emoji: string;
    score: number;
    status: TopicStatus;
    selector?: string;
    details?: TopicDetails;
}

export type FilterType = 'all' | 'pass' | 'suggest' | 'fail';

export interface Filter {
    key: FilterType;
    color: string;
    icon: string;
}