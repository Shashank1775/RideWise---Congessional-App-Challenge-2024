import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = Cookies.get('authToken'); // Retrieve token from cookies

            if (token) {
                try {
                    // Make both API calls independently
                    const [response, secondResponse] = await Promise.allSettled([
                        axios.get('/api/loginSignup', { params: { token } }),
                        axios.get('/api/adminLoginSignup', { params: { token } })
                    ]);

                    // Check if at least one call succeeded
                    console.log(response, secondResponse);
                    const userFromFirstCall = response.status === "fulfilled" && response.value.status === 200 ? response.value.data.user : null;
                    const userFromSecondCall = secondResponse.status === "fulfilled" && secondResponse.value.status === 200 ? secondResponse.value.data.admin : null;

                    if (userFromFirstCall || userFromSecondCall) {
                        setUser(userFromFirstCall || userFromSecondCall);
                    } else {
                        setError('Failed to fetch user data from both endpoints.');
                    }
                } catch (err) {
                    setError('An unexpected error occurred.');
                } finally {
                    setLoading(false);
                }
            } else {
                // No token, stop loading
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return { user, loading, error };
};

export default useAuth;
