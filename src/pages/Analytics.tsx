
import { BarChart, BarChart4, LineChart, PieChart, Users } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import AnalyticsCard from "@/components/AnalyticsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];

const Analytics = () => {
  // Mock data - in a real app this would come from Supabase
  const userStats = {
    totalUsers: 2472,
    userGrowth: 12,
    activeUsers: 1834,
    activeUsersGrowth: 8,
    newUsers: 128,
    newUsersGrowth: 15,
    engagementRate: 68,
    engagementRateGrowth: -3,
  };

  const userByCountryData = [
    { name: "India", value: 30 },
    { name: "Nigeria", value: 25 },
    { name: "Ghana", value: 20 },
    { name: "Kenya", value: 15 },
    { name: "Other", value: 10 },
  ];

  const articleByCategory = [
    { name: "Education", value: 45, color: "#4f46e5" },
    { name: "Visa", value: 38, color: "#7c3aed" },
    { name: "Scholarship", value: 42, color: "#0ea5e9" },
    { name: "Course", value: 29, color: "#10b981" },
    { name: "Immigration", value: 33, color: "#f59e0b" },
  ];

  const engagementData = [
    { name: "Mon", views: 120, saves: 42, shares: 28 },
    { name: "Tue", views: 145, saves: 55, shares: 35 },
    { name: "Wed", views: 135, saves: 48, shares: 30 },
    { name: "Thu", views: 150, saves: 52, shares: 33 },
    { name: "Fri", views: 160, saves: 58, shares: 40 },
    { name: "Sat", views: 190, saves: 65, shares: 48 },
    { name: "Sun", views: 170, saves: 60, shares: 42 },
  ];

  const lastSixMonths = [
    { name: "Jun", users: 1850, articles: 140 },
    { name: "Jul", users: 1920, articles: 152 },
    { name: "Aug", users: 2050, articles: 160 },
    { name: "Sep", users: 2120, articles: 168 },
    { name: "Oct", users: 2300, articles: 178 },
    { name: "Nov", users: 2472, articles: 187 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-100 shadow-sm rounded-md">
          <p className="text-sm font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your app's performance and user engagement metrics.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Tabs defaultValue="overview" className="w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title="Total Users"
            value={userStats.totalUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            change={userStats.userGrowth}
          />
          <AnalyticsCard
            title="Active Users"
            value={userStats.activeUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            change={userStats.activeUsersGrowth}
          />
          <AnalyticsCard
            title="New Users (30 days)"
            value={userStats.newUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            change={userStats.newUsersGrowth}
          />
          <AnalyticsCard
            title="Engagement Rate"
            value={`${userStats.engagementRate}%`}
            icon={<BarChart className="h-4 w-4" />}
            change={userStats.engagementRateGrowth}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trend</CardTitle>
              <CardDescription>Users and content growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={lastSixMonths}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="users"
                      name="Total Users"
                      stroke="#4f46e5"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="articles"
                      name="Total Articles"
                      stroke="#10b981"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Distribution</CardTitle>
              <CardDescription>Articles by category</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={articleByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {articleByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>User interactions with articles in the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={engagementData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#4f46e5" />
                  <Bar dataKey="saves" name="Saves" fill="#10b981" />
                  <Bar dataKey="shares" name="Shares" fill="#f59e0b" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Top user locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={userByCountryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userByCountryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Popular Articles</CardTitle>
              <CardDescription>Articles with the highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "New UK Student Visa Changes for International Students", views: 1245, category: "visa" },
                  { title: "Top 10 Scholarships for International Students in Canada", views: 1120, category: "scholarship" },
                  { title: "Australia Expands Immigration Pathways for Skilled Workers", views: 980, category: "immigration" },
                  { title: "New Online Courses: Learn Data Science from Top Universities", views: 875, category: "course" },
                  { title: "Germany Removes Language Requirements for Select Master's Programs", views: 820, category: "education" },
                ].map((article, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{article.category}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{article.views.toLocaleString()} views</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
