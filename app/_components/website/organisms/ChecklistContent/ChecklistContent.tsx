"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Text } from '@/website/atoms';
import { useTranslations } from 'next-intl';
import { updateChecklistProgress } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
  id: string;
  phase: string | null;
  category: string;
  title: string;
  description: string | null;
  is_mandatory: boolean;
}

interface UserProgress {
  checklist_item_id: string;
  deadline: string | null;
  is_completed: boolean;
}

interface ChecklistContentProps {
  items: ChecklistItem[];
  initialProgress: any[];
  userId: string;
}

export const ChecklistContent: React.FC<ChecklistContentProps> = ({ 
  items, 
  initialProgress,
  userId 
}) => {
  const t = useTranslations('Checklist');
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [progress, setProgress] = useState<UserProgress[]>(
    initialProgress.map(p => ({
      checklist_item_id: p.checklist_item_id,
      deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : null,
      is_completed: p.is_completed
    }))
  );
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleToggle = async (itemId: string) => {
    const current = progress.find(p => p.checklist_item_id === itemId);
    const newStatus = current ? !current.is_completed : true;
    
    // Optimistic update
    const newProgress = current 
      ? progress.map(p => p.checklist_item_id === itemId ? { ...p, is_completed: newStatus } : p)
      : [...progress, { checklist_item_id: itemId, deadline: null, is_completed: newStatus }];
    
    setProgress(newProgress);

    startTransition(async () => {
      await updateChecklistProgress(userId, itemId, { is_completed: newStatus });
    });
  };

  const handleDeadlineChange = async (itemId: string, deadline: string) => {
    const current = progress.find(p => p.checklist_item_id === itemId);
    
    // Optimistic update
    const newProgress = current 
      ? progress.map(p => p.checklist_item_id === itemId ? { ...p, deadline } : p)
      : [...progress, { checklist_item_id: itemId, deadline, is_completed: false }];
    
    setProgress(newProgress);

    startTransition(async () => {
      await updateChecklistProgress(userId, itemId, { deadline: new Date(deadline) });
    });
  };

  const phaseMap: { [key: string]: string } = {
    'Vor Umzug': 'before',
    'Während Umzug': 'during',
    'Nach Umzug': 'after'
  };

  const phases = Object.keys(phaseMap);

  return (
    <div className="min-h-screen bg-[#f9f8f4] -m-10 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#444444] text-white">
                <th className="w-12 border-r border-gray-600"></th>
                <th className="py-3 px-4 text-left font-medium text-sm border-r border-gray-600 w-32">{t('columns.category')}</th>
                <th className="py-3 px-4 text-left font-medium text-sm border-r border-gray-600 w-48">{t('columns.todo')}</th>
                <th className="py-3 px-4 text-left font-medium text-sm border-r border-gray-600">{t('columns.description')}</th>
                <th className="py-3 px-4 text-left font-medium text-sm border-r border-gray-600 w-24 text-center">{t('columns.mandatory')}</th>
                <th className="py-3 px-4 text-left font-medium text-sm border-r border-gray-600 w-40 text-center">{t('columns.deadline')}</th>
                <th className="py-3 px-4 text-center font-medium text-sm w-20">{t('columns.done')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? phases.map((phase) => {
                const phaseItems = items.filter(item => item.phase === phase);
                if (phaseItems.length === 0) return null;

                const phaseKey = phaseMap[phase];

                return (
                  <React.Fragment key={phase}>
                    {phaseItems.map((item, index) => {
                      const itemProgress = progress.find(p => p.checklist_item_id === item.id);
                      const isCompleted = itemProgress?.is_completed || false;
                      const deadline = itemProgress?.deadline || '';

                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                          {/* Phase Vertical Label - only on first row of phase */}
                          {index === 0 ? (
                            <td 
                              rowSpan={phaseItems.length} 
                              className="relative w-12 border-r border-gray-100 p-0 bg-white"
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="rotate-[-90deg] whitespace-nowrap text-[#ff4d4d] font-bold text-sm uppercase tracking-wider">
                                  {t(`phases.${phaseKey}`)}
                                </span>
                              </div>
                            </td>
                          ) : null}
                          
                          <td className="py-4 px-4 text-sm text-gray-600 border-r border-gray-100">
                            {item.category}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-800 border-r border-gray-100 font-medium">
                            {item.title}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 border-r border-gray-100 italic">
                            {item.description}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 border-r border-gray-100 text-center">
                            {item.is_mandatory ? t('status.yes') : t('status.no')}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 border-r border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="date"
                                value={deadline}
                                onChange={(e) => handleDeadlineChange(item.id, e.target.value)}
                                className="bg-transparent outline-none text-gray-600 focus:text-primary transition-colors text-xs text-center cursor-pointer"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggle(item.id)}
                              className="inline-flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-sm hover:border-primary transition-all relative mx-auto"
                            >
                              {isCompleted && (
                                <motion.div
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#ff0000]" fill="none" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </motion.div>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Text variant="text-m" className="text-gray-400">
                      {t('empty')}
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
