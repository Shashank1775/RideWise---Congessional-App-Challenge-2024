import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SignUpParents() {
    const [emailOrPhone, setEmailOrPhone] = useState('');  // Single field for email or phone
    const [password, setPassword] = useState('');
    const [district, setDistrict] = useState('');
    const [role, setRole] = useState('parent');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000); // Clear the error after 5 seconds

            return () => clearTimeout(timer); // Clear timer on component unmount or when error changes
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/loginSignup', {
                email: emailOrPhone,  // Send email or phone as a single field
                password,
                district,
                purpose: 'login',
            });

            const { token, isParent } = response.data;
            Cookies.set('authToken', token, { expires: 4 / 24 }); // Set the token with a 4-hour expiry 
            setSuccess(response.data.message);
            setError('');
            if (isParent) {
                router.push('/parent/dashboard');
            } else {
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setSuccess('');
        }
    };

    return (
        <div className="flex items-center justify-center bg-[#f6bd60] w-full sm:w-3/4 md:w-1/2  p-4">
            <div className="bg-[#e8eddf] p-8 rounded-lg shadow-lg w-full max-w-md border-4 border-[#2f4858]">
                <h1 className="text-2xl font-bold text-center mb-4 text-[#f26419] leading-relaxed">LOGIN</h1>

                {/* Display success message */}
                {success && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-4 border border-green-400 text-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Email:</label>
                        <input
                            type="email"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-[#33658a]"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-[#33658a]"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">District Code:</label>
                        <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-[#33658a]"
                            placeholder="Enter your district code"
                            required
                            maxLength={15}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#2f4858] text-white py-2 px-4 rounded-lg hover:bg-[#33658a] transition duration-300"
                    >
                        Login
                    </button>
                    {/* Display error message */}
                    {error && (
                        <div className="text-red-700 p-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                </form>
                <div className='mt-2'>
                    <p className="text-gray-700">
                        Don't Have an Account?{' '}
                        <Link href="/create-account" className="text-[#f26419] hover:underline">
                            Create One Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
