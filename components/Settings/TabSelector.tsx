
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

export interface TabType {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: TabType[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  isMobile, 
  children 
}) => {
  const getTabLabel = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab ? tab.label : '';
  };

  if (isMobile) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium border rounded-md mb-4 bg-background">
            {getTabLabel(activeTab)}
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {tabs.map(tab => (
              <DropdownMenuItem 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="space-y-6">
          {children}
        </div>
      </>
    );
  }

  return (
    <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={setActiveTab}>
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default TabSelector;
