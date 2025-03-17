
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsManagementHeaderProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const NewsManagementHeader = ({ showForm, setShowForm }: NewsManagementHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Create, edit and manage news articles for your mobile application.
        </p>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>
    </div>
  );
};

export default NewsManagementHeader;
