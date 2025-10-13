"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  recentSubmissions: Array<{
    id: string;
    projectName: string;
    companyName: string;
    status: string;
    submittedAt: string;
    tier: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/assets");
      if (response.ok) {
        const data = await response.json();
        const assets = data.assets || [];
        
        const totalSubmissions = assets.length;
        const pendingSubmissions = assets.filter((asset: any) => asset.status === "pending").length;
        const approvedSubmissions = assets.filter((asset: any) => asset.status === "approved").length;
        const rejectedSubmissions = assets.filter((asset: any) => asset.status === "rejected").length;
        
        const recentSubmissions = assets
          .slice(0, 5)
          .map((asset: any) => ({
            id: asset.id,
            projectName: asset.basicData?.projectName || "N/A",
            companyName: asset.operationsCompliance?.companyName || "N/A",
            status: asset.status || "pending",
            submittedAt: asset.submittedAt || new Date().toISOString(),
            tier: asset.operationsCompliance?.tier || "N/A",
          }));

        setStats({
          totalSubmissions,
          pendingSubmissions,
          approvedSubmissions,
          rejectedSubmissions,
          recentSubmissions,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of asset submissions and system status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              All asset registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Require revision
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
