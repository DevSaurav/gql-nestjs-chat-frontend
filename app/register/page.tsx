"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { useQuery, gql, useMutation } from "@apollo/client";
import createApolloClient from "../../apollo-client";

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(
      registerInput: { email: $email, username: $username, password: $password }
    ) {
      access_token
      user {
        _id
        username
        email
      }
    }
  }
`;

const RegisterPage = () => {
  const router = useRouter();
  const [gqlError, setError] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [registerUser] = useMutation(REGISTER_MUTATION, {
    client: createApolloClient,
  });

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    //add password match validation
    if (password !== confirmPassword) {
      setError("ERROR! Password do not match!");
      return;
    }
    if (password.length < 5) {
      setError("ERROR! Password should be at least 6 characters long.");
      return;
    }
    try {
      const { data } = await registerUser({
        variables: { username, email, password },
      });

      // Handle success (e.g., show a success message, clear form
      setSuccess("User registered successfully!");
      setPassword("");
      setEmail("");
      setUserName("");
      setEmail("");
      router.push("login");
    } catch (err: any) {
      // Handle error (e.g., show an error message)
      setError(err.message.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join and start chatting with friends</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmpassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <button className="text-purple-600 hover:text-purple-800">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-purple-600 hover:text-purple-800">
                Privacy Policy
              </button>
            </span>
          </div>
          {gqlError && <p className="text-red-700">{gqlError}</p>}
          {success && <p className="text-green-400">{success}</p>}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium"
          >
            Create Account
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push("login")}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
