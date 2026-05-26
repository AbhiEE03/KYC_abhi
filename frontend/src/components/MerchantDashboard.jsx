import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function MerchantDashboard() {
  const [kycList, setKycList] = useState([]);
  const [kycSubmission, setKycSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const fetchComplianceData = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      const data = await api.get('/kyc/merchant/');
      setKycList(data);
      setKycSubmission(data.length > 0 ? data[0] : null);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
         navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, [navigate]);

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (isEditing) {
      const cleanData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.name === "") {
          continue;
        }
        cleanData.append(key, value);
      }

      try {
        await api.patch(`/kyc/merchant/${kycSubmission.id}/`, cleanData);
        alert('Onboarding details updated successfully.');
        setIsFormVisible(false);
        setIsEditing(false);
        fetchComplianceData();
      } catch (error) {
        alert(`Update Error: ${error.message}`);
      }
    } else {
      try {
        await api.post('/kyc/merchant/', formData);
        alert('Onboarding details saved as Draft.');
        setIsFormVisible(false);
        fetchComplianceData();
      } catch (error) {
        alert(`Submission Error: ${error.message}`);
      }
    }
  };

  const handleSubmitForReview = async () => {
    if (!kycSubmission) return;
    try {
      await api.post(`/kyc/merchant/${kycSubmission.id}/submit_application/`);
      alert('Application successfully submitted for compliance review!');
      fetchComplianceData();
    } catch (error) {
      alert(`Submission Error: ${error.message}`);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-16">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">KYC Compliance Dashboard</h2>
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
        
        {kycSubmission && !isFormVisible ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Compliance Status</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{kycSubmission.business_name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 inline-flex text-sm font-bold uppercase tracking-wide rounded-full ${
                    kycSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    kycSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    kycSubmission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                  {kycSubmission.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              {(kycSubmission.status === 'draft' || kycSubmission.status === 'more_info_requested') && (
                <>
                  <button 
                    onClick={handleSubmitForReview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm shadow-sm"
                  >
                    Submit for Compliance Review
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setIsFormVisible(true);
                    }}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-6 py-2.5 rounded-lg transition text-sm shadow-sm"
                  >
                    Edit Draft Details
                  </button>
                </>
              )}
              {kycSubmission.status === 'rejected' && (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setIsFormVisible(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm shadow-sm"
                >
                  Start Fresh Application
                </button>
              )}
              {kycSubmission.status === 'under_review' && (
                <p className="text-sm text-blue-800 font-medium">Your application is currently under review by compliance audits. Changes are locked.</p>
              )}
              {kycSubmission.status === 'approved' && (
                <p className="text-sm text-green-800 font-medium">🎉 Congratulations! Your business profile is verified and active.</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800">Business Profile</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6">
                <div><span className="block text-sm font-medium text-gray-500 mb-1">Authorized Signatory</span><span className="text-gray-900 font-medium">{kycSubmission.full_name}</span></div>
                <div><span className="block text-sm font-medium text-gray-500 mb-1">Entity Type</span><span className="text-gray-900 font-medium">{kycSubmission.business_type}</span></div>
                <div><span className="block text-sm font-medium text-gray-500 mb-1">Contact Email</span><span className="text-gray-900 font-medium">{kycSubmission.email}</span></div>
                <div><span className="block text-sm font-medium text-gray-500 mb-1">Projected TPV</span><span className="text-gray-900 font-medium">${kycSubmission.expected_monthly_volume}</span></div>
              </div>
            </div>
          </div>
        ) : isFormVisible ? (
          <form onSubmit={handleOnboardingSubmit} className="space-y-8 bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {isEditing ? 'Modify Application Details' : 'Complete Business Onboarding'}
              </h3>
              <p className="text-sm text-gray-500">Provide required verification details. Documents must be PDF, JPG, or PNG (Max 5MB).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Authorized Signatory</label>
                <input required defaultValue={isEditing ? kycSubmission.full_name : ''} name="full_name" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Corporate Email</label>
                <input required defaultValue={isEditing ? kycSubmission.email : ''} name="email" type="email" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input required defaultValue={isEditing ? kycSubmission.phone_number : ''} name="phone_number" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Entity Name</label>
                <input required defaultValue={isEditing ? kycSubmission.business_name : ''} name="business_name" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Entity Type</label>
                <input required defaultValue={isEditing ? kycSubmission.business_type : ''} name="business_type" type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Projected TPV ($)</label>
                <input required defaultValue={isEditing ? kycSubmission.expected_monthly_volume : ''} name="expected_monthly_volume" type="number" step="0.01" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Document</label>
                {isEditing && <span className="block text-xs text-gray-400 mb-2">(Optional - upload to replace)</span>}
                <input required={!isEditing} name="pan_document" type="file" accept=".pdf,.jpg,.png" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhaar Document</label>
                {isEditing && <span className="block text-xs text-gray-400 mb-2">(Optional - upload to replace)</span>}
                <input required={!isEditing} name="aadhaar_document" type="file" accept=".pdf,.jpg,.png" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Statement</label>
                {isEditing && <span className="block text-xs text-gray-400 mb-2">(Optional - upload to replace)</span>}
                <input required={!isEditing} name="bank_statement" type="file" accept=".pdf,.jpg,.png" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm">
                {isEditing ? 'Save Updates' : 'Save as Draft'}
              </button>
              <button type="button" onClick={() => { setIsFormVisible(false); setIsEditing(false); }} className="bg-white text-gray-700 border border-gray-300 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition shadow-sm">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Verification Pending</h3>
            <p className="text-gray-500 mb-6">No onboarding data found for this merchant entity.</p>
            <button 
              onClick={() => setIsFormVisible(true)} 
              className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-sm">
              Complete Business Onboarding
            </button>
          </div>
        )}

        {kycList.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Application History Log
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Authorized Signatory</th>
                    <th className="px-6 py-4">Projected TPV</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {kycList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-950 font-bold">{item.business_name}</td>
                      <td className="px-6 py-4 text-gray-700">{item.full_name}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">${item.expected_monthly_volume}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-full ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          item.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantDashboard;
