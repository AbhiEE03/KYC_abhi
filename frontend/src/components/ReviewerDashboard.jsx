import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function ReviewerDashboard() {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchComplianceQueue = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      const data = await api.get('/kyc/reviewer/queue/');
      setQueue(data);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
         navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceQueue();
  }, [navigate]);

  const updateSubmissionState = async (id, newState) => {
    try {
      await api.post(`/kyc/reviewer/queue/${id}/change_state/`, { new_state: newState });
      fetchComplianceQueue(); 
    } catch (error) {
      alert(`State Transition Error: ${error.message}`);
    }
  };

  const calculateSlaRemaining = (createdAt) => {
    const deadline = new Date(createdAt).getTime() + (24 * 60 * 60 * 1000);
    const now = new Date().getTime();
    const remainingHours = Math.max(0, (deadline - now) / (1000 * 60 * 60));
    return remainingHours.toFixed(1);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Reviewer Operations</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }} 
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
        
        {queue.length > 0 ? (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Profile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SLA Deadline</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map(submission => {
                  const slaHours = calculateSlaRemaining(submission.created_at);
                  const isBreaching = slaHours <= 4;
                  
                  return (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{submission.business_name}</div>
                      <div className="text-sm text-gray-500">#{submission.id} • {submission.business_type}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-full ${
                        submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'more_info_requested' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-sm font-bold ${isBreaching ? 'text-red-600' : 'text-gray-900'}`}>
                        {slaHours}h remaining
                      </div>
                      <div className="text-xs text-gray-500">{new Date(submission.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex justify-end gap-3">
                        {submission.status === 'submitted' && (
                          <button onClick={() => updateSubmissionState(submission.id, 'under_review')} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md font-semibold transition-colors">Begin Audit</button>
                        )}
                        {submission.status === 'under_review' && (
                          <>
                            <button onClick={() => updateSubmissionState(submission.id, 'approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1.5 rounded-md font-semibold transition-colors">Approve</button>
                            <button onClick={() => updateSubmissionState(submission.id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md font-semibold transition-colors">Reject</button>
                            <button onClick={() => updateSubmissionState(submission.id, 'more_info_requested')} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded-md font-semibold transition-colors">Request Info</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Queue Empty</h3>
            <p className="text-gray-500">All submissions have been audited. No pending items.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewerDashboard;
