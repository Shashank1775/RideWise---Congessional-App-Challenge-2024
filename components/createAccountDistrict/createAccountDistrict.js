import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CreateAccountDistrict() {
    const [districtAddress, setDistrictAddress] = useState('');
    const [districtName, setDistrictName] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [districtCode, setDistrictCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isDistrictCreated, setIsDistrictCreated] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Handle district form submission
    const handleDistrictSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!districtAddress || !districtName || !zipCode) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await axios.post('/api/districtCreation', {
                districtAddress,
                districtName,
                zipCode,
            });

            if (response.status === 201) {
                setSuccess('District account created successfully');
                setDistrictAddress('');
                setDistrictName('');
                setZipCode('');
                setDistrictCode(response.data); // Assuming the API returns the district code
                setIsDistrictCreated(true); // Switch to manager creation form
            }
        } catch (error) {
            setError('Failed to create district account. ' + (error.response?.data?.error || ''));
        }
    };

    // Handle manager form submission
    const handleManagerSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!districtCode) {
            setError('District code is required to create a manager account');
            return;
        }

        try {
            const managerResponse = await axios.post('/api/adminLoginSignup', {
                userEmail: credentials.username,
                userPassword: credentials.password,
                userDistrictCode: districtCode,
                userRole: 'district manager',
                purpose: 'signup',
            });

            if (managerResponse.status === 201) {
                const token = managerResponse.data.token;

                Cookies.set('authToken', token, { expires: 7 });

                setSuccess('District manager account created successfully');
                setCredentials({ username: '', password: '' });
                router.push('/admin/dashboard');
            }
        } catch (error) {
            setError('Failed to create district manager account. ' + (error.response?.data?.error || ''));
        }
    };

    return (
        <div className="flex flex-col items-center py-8 mt-2 w-2/4">
    <div className="w-full w-[90vh] p-6 bg-[#e8eddf] shadow-lg rounded-xl border-4 border-[#2f4858] space-y-6">
        <h1 className="text-3xl font-bold text-[#f26419] mb-6">
            {isDistrictCreated ? 'Create District Manager Account' : 'Create District Account'}
        </h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        {!isDistrictCreated ? (
            <form onSubmit={handleDistrictSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">District Name:</label>
                    <input
                        type="text"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                        placeholder="Enter the district name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">District Address:</label>
                    <input
                        type="text"
                        value={districtAddress}
                        onChange={(e) => setDistrictAddress(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                        placeholder="Enter the district address"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Zip Code:</label>
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                        placeholder="Enter the zip code"
                        required
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full bg-[#2f4858] text-white px-4 py-3 rounded-lg focus:outline-none"
                    >
                        Create District
                    </button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleManagerSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Email/Username:</label>
                    <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                        placeholder="Enter your email/username"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Password:</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full bg-[#2f4858] text-white px-4 py-3 rounded-lg focus:outline-none"
                    >
                        Create District Manager
                    </button>
                </div>
            </form>
        )}
    </div>
</div>

    );
}
