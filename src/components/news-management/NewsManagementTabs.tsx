
import { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsStatus } from "@/hooks/useNewsArticles";

interface NewsManagementTabsProps {
  onValueChange: (value: NewsStatus) => void;
  children?: ReactNode;
}

const NewsManagementTabs = ({ onValueChange, children }: NewsManagementTabsProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TabsList>
        <TabsTrigger value="all">All Articles</TabsTrigger>
        <TabsTrigger value="draft">Drafts</TabsTrigger>
        <TabsTrigger value="published">Published</TabsTrigger>
      </TabsList>
      {children}
    </div>
  );
};

export default NewsManagementTabs;
