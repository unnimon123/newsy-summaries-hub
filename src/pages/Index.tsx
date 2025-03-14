
import { BarChart3, BarChart, Users, Newspaper, BellRing } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import AnalyticsCard from "@/components/AnalyticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Mock data - in a real application this would come from Supabase
  const mockStats = {
    totalUsers: 2472,
    userGrowth: 12,
    totalArticles: 187,
    articleGrowth: 8,
    categoryCounts: {
      education: 45,
      visa: 38,
      scholarship: 42,
      course: 29,
      immigration: 33,
    },
    recentNotifications: 17,
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your News Admin dashboard. Manage your content and monitor performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title="Total Users"
            value={mockStats.totalUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            change={mockStats.userGrowth}
          />
          <AnalyticsCard
            title="Total Articles"
            value={mockStats.totalArticles.toLocaleString()}
            icon={<Newspaper className="h-4 w-4" />}
            change={mockStats.articleGrowth}
          />
          <AnalyticsCard
            title="Top Category"
            value="Education"
            icon={<BarChart className="h-4 w-4" />}
            description={`${mockStats.categoryCounts.education} articles`}
          />
          <AnalyticsCard
            title="Recent Notifications"
            value={mockStats.recentNotifications}
            icon={<BellRing className="h-4 w-4" />}
            description="in the last 30 days"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Articles by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(mockStats.categoryCounts).map(([category, count]) => {
                  const categories: Record<string, string> = {
                    education: "Foreign Education",
                    visa: "Visas",
                    scholarship: "Scholarships",
                    course: "Courses",
                    immigration: "Immigration",
                  };
                  
                  const maxCount = Math.max(...Object.values(mockStats.categoryCounts));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{categories[category]}</span>
                        <span className="text-sm text-gray-500">{count} articles</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button 
                onClick={() => navigate("/news")}
                className="w-full justify-start"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Manage News Articles
              </Button>
              <Button 
                onClick={() => navigate("/notifications")}
                className="w-full justify-start"
              >
                <BellRing className="mr-2 h-4 w-4" />
                Send Push Notification
              </Button>
              <Button 
                onClick={() => navigate("/analytics")}
                variant="outline"
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
