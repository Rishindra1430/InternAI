import React, { useEffect, useState } from 'react';
import { applicationApi, jobApi } from '../api';
import { useAppDispatch, useAuth, useApplications, useJobs } from '../hooks';
import { setApplications } from '../store/slices/applicationSlice';
import { setSavedJobs } from '../store/slices/jobSlice';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils';
import {
  HiOutlineBriefcase,
  HiOutlineChatBubbleLeftRight,
  HiOutlineTrophy,
  HiOutlineBookmark,
} from 'react-icons/hi2';
import type { Application, Job } from '../types';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#3B82F6',
  Assessment: '#8B5CF6',
  Interview: '#F59E0B',
  Offer: '#10B981',
  Rejected: '#EF4444',
  Accepted: '#06B6D4',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Assessment: 'bg-purple-100 text-purple-800',
  Interview: 'bg-yellow-100 text-yellow-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Accepted: 'bg-cyan-100 text-cyan-800',
};

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { applications, statusCounts } = useApplications();
  const { savedJobs } = useJobs();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appsResponse, savedResponse] = await Promise.all([
          applicationApi.getApplications(),
          jobApi.getSavedJobs(),
        ]);

        // Handle response.data.data (Axios response + API wrapper)
        const appsData = appsResponse.data.data ?? appsResponse.data;
        const savedData = savedResponse.data.data ?? savedResponse.data;

        dispatch(setApplications(Array.isArray(appsData) ? appsData : []));
        dispatch(setSavedJobs(Array.isArray(savedData) ? savedData : []));
      } catch {
        // Silently handle errors — the store defaults will display empty states
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Build pie chart data from statusCounts, filtering out zero-count statuses
  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  // Recent 5 applications sorted by appliedAt desc
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Applications',
      value: applications.length,
      icon: HiOutlineBriefcase,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Interviews',
      value: statusCounts.Interview,
      icon: HiOutlineChatBubbleLeftRight,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Offers',
      value: statusCounts.Offer,
      icon: HiOutlineTrophy,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Saved Jobs',
      value: savedJobs.length,
      icon: HiOutlineBookmark,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="text-gray-500">Here&apos;s an overview of your career progress</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`flex-shrink-0 p-3 rounded-xl ${card.iconBg}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="card lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          {pieData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value ?? 0, name]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 text-sm">No applications yet</p>
            </div>
          )}
          {/* Legend */}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                  />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications Table */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
          {recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Job</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app: Application) => (
                    <tr
                      key={app._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 text-gray-900 font-medium">
                        {typeof app.jobId === 'string'
                          ? app.jobId
                          : (app.jobId as Job).title ?? 'Unknown Job'}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGE_CLASSES[app.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {formatDate(app.appliedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HiOutlineBriefcase className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No applications yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Start applying to jobs to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
