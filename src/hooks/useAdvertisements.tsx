import { useState, useCallback } from "react";
import { Advertisement } from "@/types/advertisement";
import { toast } from "sonner";
import {
  createAdvertisement,
  updateAdvertisement,
  toggleAdvertisementStatus,
  getAdvertisements,
  deleteAdvertisement,
} from "@/services/advertisementService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAdvertisements = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch advertisements
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ["advertisements"],
    queryFn: async () => {
      try {
        const data = await getAdvertisements();
        setError(null);
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load advertisements";
        setError(message);
        toast.error(message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create advertisement mutation
  const { mutateAsync: createAd } = useMutation({
    mutationFn: createAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      toast.success("Advertisement created successfully");
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error("Failed to create advertisement");
    }
  });

  // Update advertisement mutation
  const { mutateAsync: updateAd } = useMutation({
    mutationFn: updateAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      toast.success("Advertisement updated successfully");
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error("Failed to update advertisement");
    }
  });

  // Toggle status mutation
  const { mutateAsync: toggleStatus } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdvertisementStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      toast.success("Advertisement status updated");
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error("Failed to update advertisement status");
    }
  });

  const handleCreateAd = useCallback(async (ad: Advertisement) => {
    try {
      await createAd(ad);
      return true;
    } catch (err) {
      return false;
    }
  }, [createAd]);

  const handleUpdateAd = useCallback(async (ad: Advertisement) => {
    try {
      await updateAd(ad);
      return true;
    } catch (err) {
      return false;
    }
  }, [updateAd]);

  const handleToggleStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      await toggleStatus({ id, isActive });
      return true;
    } catch (err) {
      return false;
    }
  }, [toggleStatus]);

  // Delete advertisement mutation
  const { mutateAsync: deleteAd } = useMutation({
    mutationFn: deleteAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      toast.success("Advertisement deleted successfully");
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error("Failed to delete advertisement");
    }
  });

  const handleDeleteAd = useCallback(async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this advertisement? This action cannot be undone.");
    if (!confirmed) return false;

    try {
      await deleteAd(id);
      return true;
    } catch (err) {
      return false;
    }
  }, [deleteAd]);

  return {
    advertisements,
    isLoading,
    error,
    handleCreateAd,
    handleUpdateAd,
    handleToggleStatus,
    handleDeleteAd,
  };
};
