"use client";
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, gql, useMutation } from "@apollo/client";
import { useState } from 'react';
import createApolloClient from '../../apollo-client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
  login(loginInput: {
    username: $username
    password: $password
  }) {
    access_token
    user {
      _id
      username
      email
    }
  }
}
`;

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [gqlError, setError] = useState('');

  const [password, setPassword] = useState('');
  const [createUser, { data, loading, error }] = useMutation(LOGIN_MUTATION, { client: createApolloClient() });

  const handleSubmit = async () => {
    setError('');
    console.log(email, password)
    try {
      const {data} = await createUser({ variables: { username: email, password } });
      console.log('success', data);
      localStorage.setItem('gql_chat_access_token', data?.login?.access_token);
      // Handle success (e.g., show a success message, clear form)
      router.push('chat')
      setPassword('');
      setEmail('');
    } catch (err: any) {
      // Handle error (e.g., show an error message)
      console.error(err);
      setError(err.message.toString());
    }

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your conversations</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              name='email'
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
              placeholder="Enter your password"
            />
          </div>

          {gqlError && <p className='text-red-700'>{gqlError}</p>}

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Sign In
          </button>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</button>
          </div>

        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>

  )
};

export default LoginPage;