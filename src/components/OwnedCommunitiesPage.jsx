import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import Modal from "./Modal";
import { useSelector } from "react-redux";

const OwnedCommunitiesPage = () => {
  const [recentCommunities, setRecentCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userInfo);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchRecentCommunities(1);
    }
  }, []);

  const fetchRecentCommunities = async (page) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToastMessage("Please Login or Create account", "error");
        setIsLoading(false);
        return;
      }
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/v1/community/me/owner?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res && res.data && res.data.content) {
        console.log(res.data);
        setRecentCommunities(res.data.content.data);
        setPagination({
          currentPage: res.data.content.meta.page,
          totalPages: res.data.content.meta.pages,
          totalItems: res.data.content.meta.total,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Communities:", error);
      showToastMessage("Failed to load Communities", "error");
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();

    if (!newCommunityName || newCommunityName.length < 2) {
      showToastMessage("Community name must be at least 2 characters", "error");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        showToastMessage("Please Login or Create account", "error");
        setIsCreating(false);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/v1/community`,
        { name: newCommunityName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response && response.data && response.data.status) {
        showToastMessage("Community created successfully!", "success");
        setNewCommunityName("");
        setIsModalOpen(false);
        fetchRecentCommunities(1); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating community:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to create community",
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchRecentCommunities(newPage);
  };

  const showToastMessage = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast((prevToast) => ({ ...prevToast, show: false }));
    }, 3000);
  };

  const closeToast = () => {
    setToast((prevToast) => ({ ...prevToast, show: false }));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    let pageNumbers = [];

    // Always show first page
    pageNumbers.push(1);

    // Current page neighborhood
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    // Sort and add ellipses where needed
    pageNumbers.sort((a, b) => a - b);

    const result = [];
    let prev = 0;

    for (const num of pageNumbers) {
      if (num - prev > 1) {
        result.push("...");
      }
      result.push(num);
      prev = num;
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-purple-700">
            My Owned Communities
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-purple-700 hover:text-purple-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Community
            </button>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : recentCommunities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition duration-300 cursor-pointer"
                    onClick={() => navigate(`/community/${community.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {community.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Created:{" "}
                      {new Date(community.created_at).toLocaleDateString()}
                    </p>
                    <button className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition duration-300">
                      View Community
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      pagination.currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-purple-600 hover:bg-purple-100"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md ${
                          pagination.currentPage === page
                            ? "bg-purple-600 text-white"
                            : "text-gray-700 hover:bg-purple-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-purple-600 hover:bg-purple-100"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">
                You haven't joined any communities yet.
              </p>
              <button
                onClick={() => navigate("/search")}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-300"
              >
                Find a Community
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Community"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-4">
          <div>
            <label
              htmlFor="communityName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Community Name*
            </label>
            <input
              type="text"
              id="communityName"
              value={newCommunityName}
              onChange={(e) => setNewCommunityName(e.target.value)}
              placeholder="Enter community name (min 2 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              minLength={2}
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique slug will be automatically generated from the name.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || newCommunityName.length < 2}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Community"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default OwnedCommunitiesPage;
