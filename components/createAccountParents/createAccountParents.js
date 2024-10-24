import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function CreateAccountParents() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');
    const [district, setDistrict] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [connectedStudents, setConnectedStudents] = useState([]);
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);


    const router = useRouter();

    const handleParentSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (studentId && !connectedStudents.includes(studentId)) {
            setConnectedStudents([...connectedStudents, studentId]);
        }

        try {
            const response = await axios.post('/api/loginSignup', {
                 name,
                 email,
                 phoneNumber,
                 dob,
                 district,
                 password,
                 address,
                connectedStudents: studentId ? [...connectedStudents, studentId] : connectedStudents,
                purpose: 'signup',
            });

            const { token } = response.data;
            Cookies.set('token', token, { expires: 4 / 24 }); // Set the token with a 4-hour expiry    

            setSuccess(response.data.message);
            setError('');
            router.push('/parent/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setSuccess('');
        }
    };

    const handleConnectStudents = (e) => {
        e.preventDefault();
        if (studentId.length === 7 && !connectedStudents.includes(studentId)) {
            setConnectedStudents([...connectedStudents, studentId]);
            setStudentId('');
            setError('');
        } else if (studentId.length !== 7) {
            setError('Student ID must be 7 digits.');
        } else {
            setError('Student ID already connected.');
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError(''); // Clear error on change
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setPasswordError(''); // Clear error on change
    };

    return (
        <div className="flex flex-col items-center py-8 mt-2 w-full">
            <div className="w-full w-[90vh] p-6 bg-[#e8eddf] shadow-lg rounded-xl border-4 border-[#2f4858] space-y-6">
                <h1 className="text-3xl font-bold text-[#f26419] mb-6">Create Parent Account</h1>
                {error && <p className="text-red-600 mb-4">{error}</p>}
                {success && <p className="text-green-600 mb-4">{success}</p>}
                {passwordError && (
                    <p className="text-red-600 mb-4">{passwordError}</p>
                )}

                <form onSubmit={handleParentSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-gray-700 mb-2 font-medium">Full Name:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Email Address:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Phone Number:</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">District Code:</label>
                            <input
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                placeholder="Enter your district code"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Date of Birth:</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Address:</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                            placeholder="Enter your address ex.) 1234 Main St, City, State ZIP"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Create Password:</label>
                            <div className="relative">
                                <input
                                    type={showPassword1 ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword1(!showPassword1)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword1 ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Confirm Password:</label>
                            <div className="relative">
                                <input
                                    type={showPassword2 ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33658a]"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword2(!showPassword2)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword2 ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-600 mb-4">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-[#2f4858] text-white px-4 py-3 rounded-lg focus:outline-none"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className='flex justify-between'>
                        <p className="text-gray-700 ">
                            Already have an account?{' '}
                            <Link href="/get-started" className="text-[#f26419] hover:underline">
                                Login here
                            </Link>
                        </p>
                        <p className="text-gray-700">
                        Are you a district manager?{' '}
                        <Link href="/district-creation" className="text-[#f26419] hover:underline">
                             Create an account here.
                        </Link>
                    </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
