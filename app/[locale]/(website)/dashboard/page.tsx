"use client";

import React from 'react';
import { DashboardHeader, DocumentList, Footer } from '@/website/organisms';
import { DocumentItem } from '@/website/types';

// Mock data based on Figma screenshot
const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: '1', name: 'Vollmacht zur Ummeldung Kfz beim Strassenverkehrsamt', type: 'doc', size: '176 kB', url: '#' },
  { id: '2', name: 'Checkliste Umzug', type: 'pdf', size: '93 kB', url: '#' },
  { id: '3', name: 'Sorgerechtsverfugung', type: 'doc', size: '124 kB', url: '#' },
  { id: '4', name: 'Kundigung Mobilfunkvertrag', type: 'doc', size: '72 kB', url: '#' },
  { id: '5', name: 'Antrag auf Kindergeld', type: 'doc', size: '151 kB', url: '#' },
  { id: '6', name: 'Kundigung Zeitungsabonnement', type: 'doc', size: '151 kB', url: '#' },
  { id: '7', name: 'Ummeldung Wohnsitz', type: 'doc', size: '151 kB', url: '#' },
  { id: '8', name: 'Abmeldung hund Ordnungsamt', type: 'doc', size: '151 kB', url: '#' },
  { id: '9', name: 'Kundigung Strom-/Energievertrag', type: 'doc', size: '151 kB', url: '#' },
  { id: '10', name: 'Vollmacht zur Ummeldung Kfz beim Strassenverkehrsamt', type: 'doc', size: '151 kB', url: '#' },
  { id: '11', name: 'Checkliste Umzug', type: 'pdf', size: '93 kB', url: '#' },
  { id: '12', name: 'Sorgerechtsverfugung', type: 'doc', size: '151 kB', url: '#' },
  { id: '13', name: 'Kundigung Mobilfunkvertrag', type: 'doc', size: '151 kB', url: '#' },
  { id: '14', name: 'Antrag auf Kindergeld', type: 'doc', size: '151 kB', url: '#' },
  { id: '15', name: 'Kundigung Zeitungsabonnement', type: 'doc', size: '151 kB', url: '#' },
  { id: '16', name: 'Ummeldung Wohnsitz', type: 'doc', size: '151 kB', url: '#' },
  { id: '17', name: 'Abmeldung Hund Ordnungsamt', type: 'doc', size: '151 kB', url: '#' },
  { id: '18', name: 'Kundigung Strom-/Energievertrag', type: 'doc', size: '151 kB', url: '#' },
  { id: '19', name: 'Abmeldung Hund Ordnungsamt', type: 'doc', size: '151 kB', url: '#' },
  { id: '20', name: 'Kundigung Strom-/Energievertrag', type: 'doc', size: '151 kB', url: '#' },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background-neutral flex flex-col">
      {/* Dashboard Specific Header */}
      <DashboardHeader activeTab="documents" />

      {/* Main Content Area */}
      <section className="flex-1 w-full flex justify-center pt-10 pb-24 bg-background-secondary mb-50">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) grid grid-cols-12 gap-x-(--spacing-gutter)">
          <div className="col-span-12">
            <DocumentList documents={MOCK_DOCUMENTS} />
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
