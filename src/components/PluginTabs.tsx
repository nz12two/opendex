import { useState } from 'react';

type SortMode = 'top-rated' | 'newest' | 'most-downloaded';

interface TabDef {
  id: SortMode;
  label: string;
}

const tabs: TabDef[] = [
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'most-downloaded', label: 'Most Downloaded' },
];

export default function PluginTabs() {
  const [activeTab, setActiveTab] = useState<SortMode>('top-rated');

  const handleTabClick = (tabId: SortMode) => {
    setActiveTab(tabId);
    sortGrid(tabId);
  };

  return (
    <div class="flex items-center gap-1 border-b border-border/40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTabClick(tab.id)}
          class={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

function sortGrid(mode: SortMode) {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.plugin-item')) as HTMLElement[];
  const ratings = items.map(el => parseFloat(el.dataset.rating || '0'));
  const downloads = items.map(el => parseInt(el.dataset.downloads || '0', 10));
  const names = items.map(el => el.dataset.name || '');

  const indices = items.map((_, i) => i);
  switch (mode) {
    case 'top-rated':
      indices.sort((a, b) => ratings[b] - ratings[a]);
      break;
    case 'newest':
      indices.sort((a, b) => names[b].localeCompare(names[a]));
      break;
    case 'most-downloaded':
      indices.sort((a, b) => downloads[b] - downloads[a]);
      break;
  }

  indices.forEach((idx) => {
    grid.appendChild(items[idx]);
  });
}
