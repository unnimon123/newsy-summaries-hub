import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Advertisement } from "@/types/advertisement";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AdvertisementListProps {
  advertisements?: Advertisement[];
  isLoading?: boolean;
  onEdit?: (ad: Advertisement) => void;
  onToggleStatus?: (ad: Advertisement) => void;
  onCreateNew?: () => void;
  onDelete?: (ad: Advertisement) => Promise<void>;
}

const AdvertisementList = ({
  advertisements = [],
  isLoading = false,
  onEdit,
  onToggleStatus,
  onCreateNew,
  onDelete,
}: AdvertisementListProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">All Advertisements</h2>
        <Button onClick={onCreateNew}>Create New</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Display Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : advertisements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No advertisements found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell>Every {ad.display_frequency} cards</TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={() => onToggleStatus?.(ad)}
                      aria-label="Toggle status"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(ad)}
                    >
                      Edit
                    </Button>
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this advertisement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => onDelete(ad)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdvertisementList;
