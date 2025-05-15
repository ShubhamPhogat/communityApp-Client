import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "./Modal";
import Toast from "./Toast";
import { useDispatch, useSelector } from "react-redux";
import { COMMUNITY_ADMIN, COMMUNITY_MEMBER } from "../utils";

// Default profile picture
const DEFAULT_PROFILE_PIC =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const CommunityMemberPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.user.userInfo);

  const [community, setCommunity] = useState({
    _id: "",
    name: "",
    ownerName: "",
    members: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberData, setMemberData] = useState({
    userId: "",
    role: "member",
  });

  // Fetch community data when component mounts
  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setIsLoading(true);

      if (!id || id.length === 0) {
        showToastMessage("Failed to load community data", "error");
        return;
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToastMessage("Please login to view this community", "error");
        return;
      }

      // First fetch community details

      // Then fetch members
      const membersResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/v1/community/${id}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (membersResponse.data?.status) {
        const communityData = {
          _id: id,
          name: "Community",
          ownerName: user.name || "Unknown Owner",
          members: membersResponse.data.content.data.map((member) => ({
            _id: member.id,
            userId: member.user.id,
            userName: member.user.name,
            role: member.role.name.toLowerCase().includes("admin")
              ? "admin"
              : "member",
            createdAt: member.created_at,
            profilePic: DEFAULT_PROFILE_PIC,
          })),
        };

        setCommunity(communityData);
      } else {
        showToastMessage("Failed to load community data", "error");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching community data:", error);
      showToastMessage("Failed to load community data", "error");
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberData.userId) {
      showToastMessage("Please enter a user ID", "error");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/v1/member`,
        {
          community: id,
          user: memberData.userId,
          role:
            memberData.role === "admin"
              ? `${COMMUNITY_ADMIN}`
              : `${COMMUNITY_MEMBER}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        setMemberModalOpen(false);
        setMemberData({
          userId: "",
          role: "member",
        });
        showToastMessage("Member added successfully", "success");
      } else {
        showToastMessage(
          response.data?.message || "Failed to add member",
          "error"
        );
        setMemberModalOpen(false);
        setMemberData({
          userId: "",
          role: "member",
        });
      }
      setIsLoading(false);
    } catch (error) {
      if (error.status == 403) {
        showToastMessage(
          "You are not an Admin or Owner of the community ",
          "error"
        );
        setMemberModalOpen(false);
        setMemberData({
          userId: "",
          role: "member",
        });
      } else {
        console.error("Error adding member:", error);
        showToastMessage("Failed to add member", "error");
        setIsLoading(false);
        setMemberModalOpen(false);
        setMemberData({
          userId: "",
          role: "member",
        });
      }
    } finally {
      fetchCommunityData();
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/v1/member/${id}/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        fetchCommunityData();
        showToastMessage("Member removed successfully", "success");
      } else {
        showToastMessage(
          response.data?.message || "Failed to remove member",
          "error"
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error removing member:", error);
      showToastMessage(
        error.response?.data?.message || "Failed to remove member",
        "error"
      );
      setIsLoading(false);
    }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setMemberModalOpen(true)}
            className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Member
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-2xl font-bold text-purple-700 mb-2">
                {community.name}
              </h1>
              <p className="text-gray-600">Created by: {community.ownerName}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-purple-700">
                Community Members
              </h2>
              <p className="text-sm text-gray-500">
                Total members: {community.members.length}
              </p>
            </div>

            {community.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {community.members.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-4 mb-3">
                        <div className="relative">
                          <img
                            src={member.profilePic}
                            alt={member.userName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                            onError={(e) => {
                              e.target.src = DEFAULT_PROFILE_PIC;
                            }}
                          />
                          {member.role === "admin" && (
                            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {member.userName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            ID: {member.userId}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMember(member._id)}
                          className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
                          title="Remove member"
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                      <div className="border-t pt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span>{" "}
                          <span
                            className={`capitalize ${
                              member.role === "admin"
                                ? "text-purple-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {member.role}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined:{" "}
                          {new Date(member.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  No members in this community yet.
                </p>
                <button
                  onClick={() => setMemberModalOpen(true)}
                  className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Member
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false);
          setMemberData({
            userId: "",
            role: "member",
          });
        }}
        title="Add New Member"
      >
        <div className="space-y-4">
          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="userId"
            >
              User ID *
            </label>
            <input
              id="userId"
              name="userId"
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
              placeholder="Enter user ID"
              value={memberData.userId}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="role"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
              value={memberData.role}
              onChange={handleInputChange}
              required
            >
              <option value="member">Community Member</option>
              <option value="admin">Community Admin</option>
            </select>
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button
              onClick={() => {
                setMemberModalOpen(false);
                setMemberData({
                  userId: "",
                  role: "member",
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={isLoading}
              className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default CommunityMemberPage;
