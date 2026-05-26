import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MerchantDashboard from "./components/MerchantDashboard";
import ReviewerDashboard from "./components/ReviewerDashboard";

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50 font-sans text-gray-900">
				<header className="bg-white shadow border-b border-gray-200">
					<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
						<h1 className="text-3xl font-bold leading-tight text-gray-900">
							TrustFlow KYC
						</h1>
					</div>
				</header>
				<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/merchant" element={<MerchantDashboard />} />
						<Route path="/reviewer" element={<ReviewerDashboard />} />
						<Route path="*" element={<Navigate to="/login" replace />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
