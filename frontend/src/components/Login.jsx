import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const authenticateUser = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await api.post('/auth/token/', { username, password });
      localStorage.setItem('token', data.token);
      
      if (username.includes('reviewer')) {
        navigate('/reviewer');
      } else {
        navigate('/merchant');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 px-4 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-10 shadow-lg rounded-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Access</h2>
          <p className="text-sm text-gray-500 mt-2">Secure access to TrustFlow KYC Operations</p>
        </div>
        
        {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

        <form onSubmit={authenticateUser} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Service ID</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Access Key</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-sm"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
