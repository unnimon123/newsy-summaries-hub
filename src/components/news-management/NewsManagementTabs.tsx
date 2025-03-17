
import { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsStatus } from "@/hooks/useNewsArticles";

interface NewsManagementTabsProps {
  onValueChange: (value: NewsStatus) => void;
  value?: string;
  children?: ReactNode;
}

const NewsManagementTabs = ({ onValueChange, value, children }: NewsManagementTabsProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TabsList>
        <TabsTrigger value="all" onClick={() => onValueChange("all")}>All Articles</TabsTrigger>
        <TabsTrigger value="draft" onClick={() => onValueChange("draft")}>Drafts</TabsTrigger>
        <TabsTrigger value="published" onClick={() => onValueChange("published")}>Published</TabsTrigger>
      </TabsList>
      {children}
    </div>
  );
};

export default NewsManagementTabs;
