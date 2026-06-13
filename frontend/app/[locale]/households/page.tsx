'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Link, useRouter } from '@/i18n/navigation';
import { isAdmin } from '@/app/utils/roleUtils';
import Header from '@/app/components/Header';
import DeleteConfirmModal from '@/app/components/DeleteConfirmModal';
import InviteModal from '@/app/components/InviteModal';
import MembersModal from '@/app/components/MembersModal';
import ShareLinkModal from '@/app/components/ShareLinkModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

interface Household {
  id: string;
  householdName: string;
  createdAt: string;
  joinToken: string;
  flatmateNames?: string[];
}

export default function HouseholdsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState<Household | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [householdToInvite, setHouseholdToInvite] = useState<Household | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [householdForMembers, setHouseholdForMembers] = useState<Household | null>(null);
  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [householdToShare, setHouseholdToShare] = useState<Household | null>(null);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
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
        `${API_BASE_URL}/households`,
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

  const openInviteModal = (household: Household) => {
    setHouseholdToInvite(household);
    setInviteModalOpen(true);
  };

  const openShareLinkModal = (household: Household) => {
    setHouseholdToShare(household);
    const baseUrl = globalThis.window !== undefined ? globalThis.window.location.origin : '';
    const joinLink = `${baseUrl}/join/${household.joinToken}`;
    setShareLink(joinLink);
    setShareLinkModalOpen(true);
  };

  const handleSendInvite = async (email: string) => {
    if (!householdToInvite || !token) return;

    setIsInviting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/households/${householdToInvite.id}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inviteeEmail: email }),
        }
      );

      if (response.ok) {
        setInviteModalOpen(false);
        setHouseholdToInvite(null);
        setError('');
        setSuccess('Invitation sent successfully!');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send invitation');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const confirmDelete = async () => {
    if (!householdToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/households/${householdToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        setHouseholds(households.filter(h => h.id !== householdToDelete.id));
        setDeleteModalOpen(false);
        setHouseholdToDelete(null);
        setSuccess(data.message || 'Household deleted successfully');
      } else {
        let errorMessage = `Failed to delete household (Status: ${response.status})`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Response wasn't JSON, use default error message
        }
        
        console.error('Delete failed with status:', response.status);
        setError(errorMessage);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading households...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 dark:text-gray-100">
          {isAdmin(user?.role) ? 'My Households' : 'Households'}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 font-bold text-lg dark:text-red-300 dark:hover:text-red-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center dark:bg-green-950/40 dark:border-green-800 dark:text-green-300">
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="text-green-700 hover:text-green-900 font-bold text-lg dark:text-green-300 dark:hover:text-green-100"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {households.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-800 dark:shadow-black/30">
            {isAdmin(user?.role) ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  No Households Yet
                </h2>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  You don't have any households set up. Create one to get started!
                </p>
                <Link
                  href="/setup"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Household
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  No Households
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't been invited to any households yet. Ask a household admin to invite you!
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {households.map((household) => (
                <div
                  key={household.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-black/30"
                >
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 dark:text-gray-100">
                      {household.householdName}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3 dark:text-gray-400">
                      {new Date(household.createdAt).toLocaleDateString()}
                    </p>

                    {household.flatmateNames && household.flatmateNames.length > 0 && (
                      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 font-medium mb-1 dark:text-gray-400">Flatmates:</p>
                        <div className="flex flex-wrap gap-1">
                          {household.flatmateNames.map((name) => (
                            <span
                              key={name}
                              className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded dark:bg-indigo-900/50 dark:text-indigo-300"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-end flex-wrap">
                      {isAdmin(user?.role) && (
                        <>
                          <button
                            onClick={() => openShareLinkModal(household)}
                            className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            title="Generate shareable link for this household"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => openInviteModal(household)}
                            className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Invite
                          </button>
                          <button
                            onClick={() => {
                              setHouseholdForMembers(household);
                              setMembersModalOpen(true);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Members
                          </button>
                          <Link
                            href={`/households/${household.id}/edit`}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => openDeleteModal(household)}
                            className="px-3 py-2 bg-gray-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <Link
                        href={`/roster/${household.id}`}
                        className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isAdmin(user?.role) && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-800 dark:shadow-black/30">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  Add Another Household?
                </h2>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
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
            )}
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

      <InviteModal
        isOpen={inviteModalOpen}
        householdName={householdToInvite?.householdName || ''}
        isInviting={isInviting}
        onInvite={handleSendInvite}
        onCancel={() => {
          setInviteModalOpen(false);
          setHouseholdToInvite(null);
        }}
      />

      <MembersModal
        isOpen={membersModalOpen}
        householdId={householdForMembers?.id || ''}
        householdName={householdForMembers?.householdName || ''}
        token={token}
        onClose={() => {
          setMembersModalOpen(false);
          setHouseholdForMembers(null);
        }}
        onMemberRemoved={() => {
          setSuccess('Member removed successfully');
          setTimeout(() => setSuccess(''), 5000);
        }}
      />

      <ShareLinkModal
        isOpen={shareLinkModalOpen}
        householdId={householdToShare?.id || ''}
        householdName={householdToShare?.householdName || ''}
        joinLink={shareLink}
        onClose={() => {
          setShareLinkModalOpen(false);
          setHouseholdToShare(null);
          setShareLink('');
        }}
      />
    </div>
  );
}
