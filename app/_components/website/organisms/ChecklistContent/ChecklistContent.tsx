"use client";

import React, { useState, useTransition, useEffect, useMemo } from 'react';
import { Text } from '@/website/atoms';
import { useTranslations } from 'next-intl';
import { updateChecklistProgress } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingDeadlineId, setUpdatingDeadlineId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  // Filter items based on search query (client-side)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.phase && item.phase.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  if (!mounted) return null;

  const handleToggle = async (itemId: string) => {
    const current = progress.find(p => p.checklist_item_id === itemId);
    const newStatus = current ? !current.is_completed : true;

    setTogglingId(itemId);
    // Optimistic update
    const newProgress = current
      ? progress.map(p => p.checklist_item_id === itemId ? { ...p, is_completed: newStatus } : p)
      : [...progress, { checklist_item_id: itemId, deadline: null, is_completed: newStatus }];

    setProgress(newProgress);

    startTransition(async () => {
      await updateChecklistProgress(userId, itemId, { is_completed: newStatus });
      setTogglingId(null);
    });
  };

  const handleDeadlineChange = async (itemId: string, deadline: string) => {
    const current = progress.find(p => p.checklist_item_id === itemId);

    setUpdatingDeadlineId(itemId);
    // Optimistic update
    const newProgress = current
      ? progress.map(p => p.checklist_item_id === itemId ? { ...p, deadline } : p)
      : [...progress, { checklist_item_id: itemId, deadline, is_completed: false }];

    setProgress(newProgress);

    startTransition(async () => {
      await updateChecklistProgress(userId, itemId, { deadline: new Date(deadline) });
      setUpdatingDeadlineId(null);
    });
  };

  const phaseMap: { [key: string]: string } = {
    'Vor Umzug': 'before',
    'Während Umzug': 'during',
    'Nach Umzug': 'after'
  };

  const phases = Object.keys(phaseMap);

  return (
    <div className="w-full">
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="w-full border-separate border-spacing-y-[4px] min-w-[1000px]">
          <thead>
            <tr className="text-white">
              {/* Space for Phase Label Column */}
              <th className="w-16 min-w-[60px] bg-transparent"></th>

              <th className="py-[12px] px-4 text-left bg-[#333333] first:rounded-tl-sm relative w-32">
                <Text variant="table-heading" className="text-white">{t('columns.category')}</Text>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
              </th>
              <th className="py-[12px] px-4 text-left bg-[#333333] relative w-48">
                <Text variant="table-heading" className="text-white">{t('columns.todo')}</Text>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
              </th>
              <th className="py-[12px] px-4 text-left bg-[#333333] relative">
                <Text variant="table-heading" className="text-white">{t('columns.description')}</Text>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
              </th>
              <th className="py-[12px] px-4 text-center bg-[#333333] relative w-24">
                <Text variant="table-heading" className="text-white">{t('columns.mandatory')}</Text>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
              </th>
              <th className="py-[12px] px-4 text-center bg-[#333333] relative w-40">
                <Text variant="table-heading" className="text-white">{t('columns.deadline')}</Text>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-white/20" />
              </th>
              <th className="py-[12px] px-4 text-center bg-[#333333] last:rounded-tr-sm w-20">
                <Text variant="table-heading" className="text-white">{t('columns.done')}</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? phases.map((phase, phaseIndex) => {
              const phaseItems = filteredItems.filter(item => item.phase === phase);
              if (phaseItems.length === 0) return null;

              const phaseKey = phaseMap[phase];

              return (
                <React.Fragment key={phase}>
                  {/* Phase Gap Spacer - significant gap between phases */}
                  {phaseIndex > 0 && (
                    <tr className="h-24">
                      <td colSpan={7}></td>
                    </tr>
                  )}

                  {phaseItems.map((item, index) => {
                    const itemProgress = progress.find(p => p.checklist_item_id === item.id);
                    const isCompleted = itemProgress?.is_completed || false;
                    const deadline = itemProgress?.deadline || '';

                    // Format date as DD.MM.YY for display
                    const formattedDate = deadline
                      ? `${deadline.split('-')[2]}.${deadline.split('-')[1]}.${deadline.split('-')[0].slice(-2)}`
                      : '';

                    return (
                      <tr key={item.id} className="group transition-colors">
                        {/* Phase Vertical Label */}
                        {index === 0 ? (
                          <td
                            rowSpan={phaseItems.length}
                            className="relative w-16 min-w-[60px] bg-transparent align-middle"
                          >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="rotate-[-90deg] whitespace-nowrap text-[#ff0000] text-checklist-phase uppercase tracking-[0.15em] origin-center">
                                {t(`phases.${phaseKey}`)}
                              </span>
                            </div>
                            {/* Hidden spacer to prevent labels from merging when there are few items (e.g. during search) */}
                            <div className="invisible h-24 w-full" />
                          </td>
                        ) : null}

                        <td className="py-[6.5px] px-4 relative bg-white first:rounded-l-sm group-hover:bg-gray-50 transition-colors">
                          <Text variant="table-data">{item.category}</Text>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                        </td>
                        <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors">
                          <Text variant="table-data" className="font-medium">{item.title}</Text>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                        </td>
                        <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors">
                          <Text variant="table-data" className="text-secondary/60">{item.description}</Text>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                        </td>
                        <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors text-center">
                          <Text variant="table-data">{item.is_mandatory ? t('status.yes') : t('status.no')}</Text>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                        </td>
                        <td className="py-[6.5px] px-4 relative bg-white group-hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between gap-2 relative min-h-[32px] w-full px-2">
                            {/* Display Date with updated typography */}
                            <span className="text-table-data flex-1 text-center font-normal">
                              {formattedDate}
                            </span>

                            {/* Custom Arrow Icon or Loader */}
                            <div className="relative w-4 h-4 flex items-center justify-center">
                              {updatingDeadlineId === item.id ? (
                                <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <img
                                  src="/assets/website/icons/black-down-arrow-icon.png"
                                  alt="arrow"
                                  className="w-[8px] h-[8px] transform rotate-[270deg] opacity-70 -translate-y-[6.5px]"
                                />
                              )}
                            </div>

                            {/* Transparent Date Input Overlay */}
                            <input
                              type="date"
                              value={deadline}
                              disabled={!!updatingDeadlineId}
                              onChange={(e) => handleDeadlineChange(item.id, e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              onClick={(e) => {
                                try {
                                  (e.target as any).showPicker();
                                } catch (err) { }
                              }}
                            />
                          </div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-gray-300" />
                        </td>
                        <td className="py-[6.5px] px-4 text-center bg-white last:rounded-r-sm group-hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => handleToggle(item.id)}
                            disabled={togglingId === item.id}
                            className={`inline-flex items-center justify-center w-[22px] h-[22px] border-[1.5px] rounded-[4px] transition-all relative mx-auto border-[#868281] bg-white ${togglingId === item.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {togglingId === item.id ? (
                              <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            ) : isCompleted && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <img 
                                  src="/assets/website/icons/check-sign.png" 
                                  alt="checked"
                                  className="w-[14px] h-[10px] object-contain"
                                />
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
                  <Text variant="text-m" className="text-secondary/30 font-medium">
                    {t('empty')}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
