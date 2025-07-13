'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Analytics } from '@/types';
import { products } from '@/lib/brand-data';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<{ warm: Analytics; formal: Analytics } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      setError('Failed to fetch analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!analytics) return null;

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || productId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                TechNova Chatbot Study Dashboard
              </h1>
              <p className="text-gray-500">Analytics and Performance Metrics</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Warm Bot Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Warm Chatbot</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Conversations:</span>
                <span className="font-semibold">{analytics.warm.totalConversations}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Rate:</span>
                <span className="font-semibold">{analytics.warm.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span className="font-semibold">{analytics.warm.avgConversationDuration.toFixed(1)} min</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Messages:</span>
                <span className="font-semibold">{analytics.warm.avgMessagesPerConversation.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Formal Bot Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Formal Chatbot</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Conversations:</span>
                <span className="font-semibold">{analytics.formal.totalConversations}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Rate:</span>
                <span className="font-semibold">{analytics.formal.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span className="font-semibold">{analytics.formal.avgConversationDuration.toFixed(1)} min</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Messages:</span>
                <span className="font-semibold">{analytics.formal.avgMessagesPerConversation.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warm Bot Product Engagement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-purple-600 mb-4">
              Warm Bot - Product Engagement
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.warm.productEngagement).map(([productId, engagement]) => (
                <div key={productId} className="border-b pb-2">
                  <div className="font-medium text-sm">{getProductName(productId)}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                    <div>Views: {engagement.views}</div>
                    <div>Inquiries: {engagement.inquiries}</div>
                    <div>Cart: {engagement.addToCart}</div>
                    <div>Intent: {engagement.purchaseIntent}</div>
                  </div>
                </div>
              ))}
              {Object.keys(analytics.warm.productEngagement).length === 0 && (
                <div className="text-gray-500 text-center py-4">No product engagement yet</div>
              )}
            </div>
          </div>

          {/* Formal Bot Product Engagement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              Formal Bot - Product Engagement
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.formal.productEngagement).map(([productId, engagement]) => (
                <div key={productId} className="border-b pb-2">
                  <div className="font-medium text-sm">{getProductName(productId)}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                    <div>Views: {engagement.views}</div>
                    <div>Inquiries: {engagement.inquiries}</div>
                    <div>Cart: {engagement.addToCart}</div>
                    <div>Intent: {engagement.purchaseIntent}</div>
                  </div>
                </div>
              ))}
              {Object.keys(analytics.formal.productEngagement).length === 0 && (
                <div className="text-gray-500 text-center py-4">No product engagement yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}