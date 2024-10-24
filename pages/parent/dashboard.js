import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // Library for handling cookies if needed
import useAuth from "@/contexts/checkAuthStatus";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from 'framer-motion';

// Parent Dashboard component
const BusMap = dynamic(() => import('@/components/parentStuff/parentMap'), { ssr: false });

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); // State to track the active tab
  const [sidebarOpen, setSidebarOpen] = useState(true); // State to track sidebar visibility
  const [studentId, setStudentId] = useState(""); // State to store student ID
  const [loading, setLoading] = useState(false); // State for loading indication
  const { user } = useAuth();
  const router = useRouter();
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [connectedBusNumbers, setConnectedBusNumbers] = useState([]);
  const [coordinatesData, setCoordinatesData] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // State for pending requests
  const [reminders, setReminders] = useState([]); // State for reminders

  useEffect(() => {
    setTimeout(() => {
      if (!user) {
        //router.push("/get-started");
      }
    }, 3000);
  }, [user, router]);

  useEffect(() => {
    axios.get("/api/remindersAndAlerts", {params:{busNumber: connectedBusNumbers}, paramsSerializer: (params) => {
      return new URLSearchParams(params).toString(); // Ensure correct array serialization
    },}).then((response) => {
      console.log(response.data);
      setReminders(response.data);
    });
  }, [connectedBusNumbers]);
  

  const fetchBusRoute = async () => {
    if (user && connectedBusNumbers.length > 0) {
      setLoading(true);
      try {
        const response = await axios.get("/api/gps", {
          params: { busNumber: connectedBusNumbers },
          paramsSerializer: (params) => {
            return new URLSearchParams(params).toString(); // Ensure correct array serialization
          },
        });
  
        var busRouteData = response.data.recentLocations;
        busRouteData = busRouteData.map(journey => journey.locations)
        // Log the entire busRouteData structure
        console.log("BUS ROUTE DATA", busRouteData);
  
        console.log("COORDINATES",  busRouteData.map(journey => 
          journey.map(location => location.coordinates)
        ));
        // Set the coordinates data to state
        setCoordinatesData(busRouteData.map(journey => 
          journey.map(location => location.coordinates)
        ));
      } catch (error) {
        console.error("Error fetching bus route:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  
  useEffect(() => {
    const fetchInitialBusRoute = async () => {
      await fetchBusRoute(); // Initial immediate fetch
      const interval = setInterval(fetchBusRoute, 15000); // Fetch every 5 seconds afterward
      return () => clearInterval(interval); // Cleanup interval on unmount
    };
  
    if (user && connectedBusNumbers.length > 0) {
      fetchInitialBusRoute(); // Start the fetch process
    }
  }, [user, connectedBusNumbers]);
  // 
  
  // Fetch student data based on user info
  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch connected student IDs based on user info
        const idResponse = await axios.get("/api/studentAddRequest", {
          params: { parentPhone: user.userPhoneNumber, parentEmail: user.userEmail },
        });
  
        const fetchedStudentIds = idResponse.data;
        const uniqueStudentIds = [...new Set(fetchedStudentIds.map(student => student.studentId))];
        console.log(idResponse.data);
        setPendingRequests(idResponse.data.filter(request => request.status === 'pending'));
        setConnectedBusNumbers(uniqueStudentIds);
  
        // Fetch student details based on student IDs
        if (uniqueStudentIds.length > 0) {
          const studentResponse = await axios.get("/api/studentCreation", {
            params: { studentIds: uniqueStudentIds }, // Pass array of IDs
            paramsSerializer: (params) => {
              return new URLSearchParams(params).toString(); // Ensure correct array serialization
            },
          });
  
          const students = studentResponse.data;
          setConnectedStudents(students); // Update state with fetched student data
          setConnectedBusNumbers(students.map(student => student.busNumber)); // Extract bus numbers
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchStudentData(); // Fetch student data if user exists
    }
  }, [user]);
  
  const onSubmitAddStudent = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    // Create a pending request object
    const newPendingRequest = {
      studentId,
      parentName: user.userFullName,
      parentPhone: user.userPhoneNumber,
      parentEmail: user.userEmail,
      parentAddress: user.userAddress,
      districtCode: user.userDistrictCode,
      dateOfBirth: user.userDOB,
      status: 'pending', // Default status
    };
  
    // Add the new request to pending requests
    setPendingRequests(prev => [...prev, newPendingRequest]);
  
    try {
      await axios.post("/api/studentAddRequest", newPendingRequest);
      alert('Student request sent successfully!');
      setStudentId(""); // Clear input after submission
    } catch (error) {
      console.error("Error sending student request:", error);
      alert('Failed to send request. Please try again.');
  
      // If the submission fails, update the last pending request to reflect that
      setPendingRequests(prev => {
        const updatedRequests = [...prev];
        updatedRequests[updatedRequests.length - 1].status = 'failed'; // Update status to failed
        return updatedRequests;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  }

  if(!user){
    return(
      <div className="items-center flex justify-center h-screen">
        <div role="status" className="items-center flex justify-center flex-col">
          <svg aria-hidden="true" class="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Loading...</span>
      </div>
      </div>
    )
  }

  // Function to render the content based on the selected tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-8 bg-gray-800">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-4 text-white"
      >
        Dashboard
      </motion.h2>
      {loading ? (
        <div className="flex justify-center items-center h-[82vh]">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-lg text-white"
          >
            Loading...
          </motion.span>
        </div>
      ) : (
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#e8eddf] p-4 w-3/4 h-[92vh] border-4 border-[#2f4858] rounded-lg shadow-lg"
          >
            <BusMap cords={coordinatesData} parentAddress={user?.userAddress} user={user} busNumbers={connectedBusNumbers} />
          </motion.div>
          <div className="w-1/4 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#e8eddf] p-4 h-2/3 border-4 border-[#2f4858] rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">Student Status</h3>
              <div className="flex flex-col gap-2">
                {connectedStudents.map((student, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-md bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <span>{student.studentName}</span>
                    <span
                      className={`inline-block w-4 h-4 rounded-full ${
                        student.status ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#e8eddf] p-4 h-2/3 border-4 border-[#2f4858] rounded-lg shadow-lg"
            >
              <span className="flex items-center justify-start pb-4 transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-0 mr-2">
                  Alerts
                </h3>
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              </span>
              <div className="flex flex-col gap-2">
                {reminders.length > 0 ? (
                  reminders.slice(0, 2).map((alert, index) => (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.2 }}
                      className="flex flex-col p-2 rounded-md bg-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <span className="font-bold">{alert.busNumber}</span>
                      <span>{alert.message}</span>
                      <span className="text-gray-500">{new Date(alert.date).toLocaleString()}</span>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-500"
                  >
                    No alerts at this time.
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
        );
        case "students":
  return (
<motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="p-8 bg-gray-800 rounded-lg shadow-md"
    >
      <motion.h2 
        initial={{ y: -20 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-4 text-white"
      >
        Students
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Add Students Section */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="bg-[#e8eddf] p-6 transition-shadow hover:shadow-lg border-4 border-[#2f4858] rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add Students</h3>
          <form onSubmit={onSubmitAddStudent} className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
            <div className="mr-4 flex items-center justify-start gap-1 w-full">
              <label htmlFor="studentId" className="block mb-2 text-gray-800 font-semibold">
                Student ID:
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                placeholder="Enter Student ID"
                className="p-3 w-full outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200 border-2 border-[#2f4858] rounded-md"
                onChange={(e) => setStudentId(e.target.value)}
                value={studentId}
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600 transition duration-200 flex items-center border-2 border-[#2f4858]"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Connect
            </motion.button>
          </form>
        </motion.div>

        {/* View Students Section */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="bg-[#e8eddf] p-6 border-4 border-[#2f4858] transition-shadow hover:shadow-lg rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">View Students</h3>
          <div className="grid grid-cols-3 mb-4 text-gray-600 font-semibold">
            <span>Name</span>
            <span>Bus Number</span>
            <span>Student ID</span>
          </div>
          <motion.div className="flex flex-col gap-2">
            {connectedStudents.map((student, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-md bg-gray-50 shadow-md transition-all hover:bg-yellow-100"
              >
                <span className="text-gray-800">{student.studentName}</span>
                <span className="text-gray-600">{student.busNumber}</span>
                <span className="text-gray-600">{student.studentId}</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className={`inline-block w-4 h-4 rounded-full ${
                    student.status ? "bg-green-500" : "bg-red-500"
                  }`}
                ></motion.span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Pending Requests Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#e8eddf] p-6 border-4 border-[#2f4858] transition-shadow hover:shadow-lg col-span-full md:col-span-2 rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Pending Requests</h3>
          <div className="grid grid-cols-3 mb-4 text-gray-600 font-semibold">
            <span>Student ID</span>
            <span>Parent Name</span>
            <span>Status</span>
          </div>
          <motion.div className="flex flex-col gap-2">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-md bg-gray-50 shadow-md transition-all hover:bg-yellow-100"
                >
                  <span className="text-gray-800">{request.studentId}</span>
                  <span className="text-gray-600">{request.parentName}</span>
                  <span className="text-yellow-500">{request.status}</span>
                </motion.div>
              ))
            ) : (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="text-gray-600"
              >
                No pending requests.
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
  case "settings":
    return (
      <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="p-8 bg-gray-800 rounded-lg shadow-lg"
    >
      <motion.h2 
        initial={{ y: -20 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-white"
      >
        Settings
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#e8eddf] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Account</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors duration-300 flex items-center justify-center space-x-2 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </motion.button>
        </motion.div>
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#e8eddf] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Preferences</h3>
          <p className="text-gray-600 mb-4">Customize your experience with additional settings.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center space-x-2 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>Manage Preferences</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
    );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
  {/* Sidebar */}
  <motion.aside
      initial={{ width: 0 }} // Start hidden
      animate={{ width: sidebarOpen ? 256 : 0 }} // Expand or collapse
      exit={{ width: 0 }} // Hide when closed
      className={`bg-white shadow-lg transition-transform duration-300 ease-in-out overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold text-gray-800">Parent Dashboard</h1>
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
            activeTab === "dashboard" ? "bg-gray-200 font-semibold" : "hover:bg-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
            activeTab === "students" ? "bg-gray-200 font-semibold" : "hover:bg-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          Students
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
            activeTab === "settings" ? "bg-gray-200 font-semibold" : "hover:bg-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          Settings
        </button>
      </nav>
    </motion.aside>
  {/* Main Content */}
  <main className="flex-1 p-6 bg-gray-800">
    {renderContent()} {/* Render the content based on the selected tab */}
  </main>
</div>

  );
}
