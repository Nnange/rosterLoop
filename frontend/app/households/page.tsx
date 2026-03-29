'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { isAdmin } from '@/app/utils/roleUtils';
import Header from '@/app/components/Header';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';

interface Household {
  id: string;
  householdName: string;
  createdAt: string;
  flatmateNames?: string[];
}

export default function HouseholdsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState<Household | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !isAdmin(user.role)) {
      router.push('/waiting');
      return;
    }

    if (user && token) {
      fetchHouseholds();
    }
  }, [user, token, authLoading, router]);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://localhost:8080/rosterloop/api/households',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHouseholds(data);
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load households');
      }
    } catch (err) {
      setError('Error fetching households');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (household: Household) => {
    setHouseholdToDelete(household);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!householdToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:8080/rosterloop/api/households/${householdToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setHouseholds(households.filter(h => h.id !== householdToDelete.id));
        setDeleteModalOpen(false);
        setHouseholdToDelete(null);
      } else {
        setError('Failed to delete household');
      }
    } catch (err) {
      setError('Error deleting household');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteHousehold = async (householdId: string) => {
    const household = households.find(h => h.id === householdId);
    if (household) {
      openDeleteModal(household);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading households...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}

        {households.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Households Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have any households set up. Create one to get started!
            </p>
            <Link
              href="/setup"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Household
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {households.map((household) => (
                <div
                  key={household.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
                >
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {household.householdName}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3">
                      {new Date(household.createdAt).toLocaleDateString()}
                    </p>
                    
                    {household.flatmateNames && household.flatmateNames.length > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Flatmates:</p>
                        <div className="flex flex-wrap gap-1">
                          {household.flatmateNames.map((name, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/roster/${household.id}`}
                        className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/households/${household.id}/edit`}
                        className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteHousehold(household.id)}
                        className="px-3 py-2 bg-gray-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Add Another Household?
              </h2>
              <p className="text-gray-600 mb-6">
                Create an additional household to manage another cleaning
                schedule
              </p>
              <Link
                href="/setup"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create New Household
              </Link>
            </div>
          </div>
        )}
      </main>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        householdName={householdToDelete?.householdName || ''}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setHouseholdToDelete(null);
        }}
      />
    </div>
  );
}
