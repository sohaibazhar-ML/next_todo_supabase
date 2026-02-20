/** Landing page design tokens extracted from the reference design */
export const LANDING_COLORS = {
    primary: '#e62e2d',
    primaryHover: '#cc2827',
    dark: '#1a1a1a',
    body: '#4a4a4a',
    muted: '#6b6b6b',
    lightBg: '#f5f5f5',
    border: '#e0e0e0',
    white: '#ffffff',
    callbackBg: '#e62e2d',
} as const;

export const NAV_LINKS = [
    { key: 'howItWorks', href: '#so-gehts' },
    { key: 'myDocuments', href: '#my-documents' },
    { key: 'contact', href: '#kontakt' },
] as const;

export const STEPS = [
    { number: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
    { number: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
    { number: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

export const CHECKLIST_ITEMS = [
    'checkItem1',
    'checkItem2',
    'checkItem3',
    'checkItem4',
    'checkItem5',
] as const;

export const BENEFITS = [
    'benefit1',
    'benefit2',
    'benefit3',
    'benefit4',
] as const;

export const FOOTER_LINKS = {
    company: ['aboutUs', 'faq'] as const,
    legal: ['impressum', 'datenschutz', 'agb'] as const,
};
