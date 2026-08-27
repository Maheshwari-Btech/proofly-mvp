import React from 'react';
import { MatchStatus, RequirementImportance, EvidenceType } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface MatchStatusBadgeProps {
  status: MatchStatus;
  size?: 'sm' | 'md';
}

export const MatchStatusBadge: React.FC<MatchStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'Strong':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-bold ${sizeClasses}`}
        >
          <span className="h-2 w-2 rounded-full bg-purple-600"></span>
          Strong Match
        </span>
      );
    case 'Partial':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
          Partial Evidence
        </span>
      );
    case 'Weak':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
          Weak Evidence
        </span>
      );
    case 'Missing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
          Missing Evidence
        </span>
      );
    default:
      return null;
  }
};

interface ImportanceBadgeProps {
  importance: RequirementImportance;
}

export const ImportanceBadge: React.FC<ImportanceBadgeProps> = ({ importance }) => {
  switch (importance) {
    case 'Critical':
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-purple-100 text-purple-900 uppercase tracking-wide border border-purple-300">
          Critical
        </span>
      );
    case 'Important':
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 uppercase tracking-wide border border-purple-200">
          Important
        </span>
      );
    case 'Bonus':
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-purple-50/60 text-purple-600 uppercase tracking-wide border border-purple-100">
          Bonus
        </span>
      );
  }
};

interface EvidenceTypeBadgeProps {
  type: EvidenceType;
}

export const EvidenceTypeBadge: React.FC<EvidenceTypeBadgeProps> = ({ type }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'Project':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Certificate':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'GitHub':
        return 'bg-purple-900 text-purple-100 border-purple-800';
      case 'Course':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Internship':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Resume':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Competition':
        return 'bg-purple-200/70 text-purple-900 border-purple-300';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getBadgeStyle()}`}>
      {type}
    </span>
  );
};

export interface VerificationBadgeProps {
  status?: string;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status = 'Verified',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
      {status}
    </span>
  );
};

export interface PurpleBadgeProps {
  children: React.ReactNode;
  variant?: 'solid' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const PurpleBadge: React.FC<PurpleBadgeProps> = ({
  children,
  variant = 'subtle',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';
  const variantClasses =
    variant === 'solid'
      ? 'bg-purple-600 text-white border-transparent'
      : variant === 'outline'
      ? 'bg-transparent text-purple-700 border-purple-300'
      : 'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

export interface SkillPillProps {
  skill: string;
  isMatched?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SkillPill: React.FC<SkillPillProps> = ({
  skill,
  isMatched = false,
  onClick,
  className = '',
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
        isMatched
          ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
          : 'bg-purple-50/60 text-purple-800 border-purple-100 hover:bg-purple-100'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {skill}
    </span>
  );
};

