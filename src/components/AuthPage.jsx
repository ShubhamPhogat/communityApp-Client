import { useState } from "react";
import {
  X,
  CheckCircle,
  Mail,
  Lock,
  User,
  Phone,
  CopyIcon,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions/userActions";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg ${
        type === "success"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 mr-2" />
      ) : (
        <X className="w-5 h-5 mr-2" />
      )}
      <div className="text-sm font-normal">{message}</div>
      <button onClick={onClose} className="ml-4">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Sign In / Sign Up Page
export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: "",

    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "First name is required";

    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("hit");
    try {
      if (1) {
        console.log("Form Data:", formData);
        if (isSignIn) {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/v1/auth/signin`,
            formData
          );
          if (res) {
            console.log(res.data.content);
            dispatch(
              setUser({
                id: res.data.content.data.id,
                name: res.data.content.data.name,
                email: res.data.content.data.email,
              })
            );
            localStorage.setItem("authToken", res.data.content.data.token);
            navigate("/home");
          }
        } else {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/v1/auth/signup`,
            formData
          );
          console.log(res.data);
          dispatch(
            setUser({
              id: res.data.content.data.id,
              name: res.data.content.data.name,
              email: res.data.content.data.email,
            })
          );
          localStorage.setItem("authToken", res.data.content.data.token);
          navigate("/home");
        }

        setToast({
          show: true,
          message: isSignIn
            ? "Successfully signed in!"
            : "Account created successfully!",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">WishShare</h1>
          <p className="text-gray-600">
            Create and share wishlists with friends
          </p>
        </div>

        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 font-medium ${
              isSignIn
                ? "text-purple-700 border-b-2 border-purple-700"
                : "text-gray-500"
            }`}
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 font-medium ${
              !isSignIn
                ? "text-purple-700 border-b-2 border-purple-700"
                : "text-gray-500"
            }`}
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                    placeholder="John"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                placeholder="john@example.com"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                placeholder="••••••••"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            // onClick={handleSubmit}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300"
          >
            {isSignIn ? "Sign In" : "Create Account"}
          </button>
        </form>

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </div>
    </div>
  );
}
