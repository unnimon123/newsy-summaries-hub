import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Advertisement as AdvertisementType } from "@/types/advertisement";
import AdvertisementList from "@/components/advertisement/AdvertisementList";
import AdvertisementForm from "@/components/advertisement/AdvertisementForm";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import { AdvertisementListSkeleton } from "@/components/advertisement/AdvertisementSkeleton";
import { AdvertisementFormSkeleton } from "@/components/advertisement/AdvertisementFormSkeleton";
import { AdvertisementError } from "@/components/advertisement/AdvertisementError";
import { useQueryClient } from "@tanstack/react-query";

const Advertisement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdvertisementType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    advertisements,
    isLoading,
    error,
    handleCreateAd,
    handleUpdateAd,
    handleToggleStatus,
    handleDeleteAd
  } = useAdvertisements();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Advertisements</h1>
      <Card>
        <Tabs defaultValue="manage" className="w-full">
          <TabsList>
            <TabsTrigger value="manage">Manage Ads</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="p-4">
            {showForm || editingAd ? (
              isLoading ? (
                <AdvertisementFormSkeleton />
              ) : (
                <AdvertisementForm
                  advertisement={editingAd}
                  isSubmitting={isSubmitting}
                  onSubmit={async (ad) => {
                    setIsSubmitting(true);
                    try {
                      const success = editingAd 
                        ? await handleUpdateAd(ad)
                        : await handleCreateAd(ad);
                      
                      if (success) {
                        setShowForm(false);
                        setEditingAd(null);
                      }
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingAd(null);
                  }}
                />
              )
            ) : (
              <>
                {error && (
                  <AdvertisementError
                    error={error}
                    resetState={() => {
                      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
                    }}
                  />
                )}
                {isLoading ? (
                  <AdvertisementListSkeleton />
                ) : (
                  <AdvertisementList
                    advertisements={advertisements}
                    isLoading={isLoading}
                    onCreateNew={() => setShowForm(true)}
                    onEdit={setEditingAd}
                    onToggleStatus={(ad) => handleToggleStatus(ad.id, !ad.is_active)}
                    onDelete={async (ad) => {
                      if (ad.id) {
                        await handleDeleteAd(ad.id);
                      }
                    }}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Advertisement;
