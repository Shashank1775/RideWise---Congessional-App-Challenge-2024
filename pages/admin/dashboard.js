import { useEffect, useState } from "react";
import useAuth from "@/contexts/checkAuthStatus";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import StudentsBusesInfo from "@/components/adminStuff/studentBusInfo";
import AdminHomeGraphs from "@/components/adminHomeGraphs/adminHomeGraphs";
import AdminHomeCharts from "@/components/adminHomeGraphs/adminHomeCharts";
import Cookies from "js-cookie";

// Dynamically import components
const AddBus = dynamic(() => import('@/components/adminStuff/adminAddBus'), { ssr: false });

export default function AdminDashboard() {
  const { user } = useAuth();
  console.log("User:", user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("monitor-buses");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for students
  const [studentName, setStudentName] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState(""); // State for birthdate
  const [studentBusNumber, setStudentBusNumber] = useState(""); // State for bus number
  const [csvFile, setCsvFile] = useState(null);
  const [students, setStudents] = useState([]); // State to store student data
  const [busRoutes, setBusRoutes] = useState([]); // State to store bus route data
  const [requests, setRequests] = useState([]); // State to store add student requests
  const [reminderText, setReminderText] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [studentsOnboard, setStudentsOnboard] = useState([]); // State to store students onboard
  const [studentsArrived, setStudentsArrived] = useState([]); // State to store students arrived
  const [averageDistance, setAverageDistance] = useState(0); // State to store average distance

  console.log("Students:", students);

  const busNumbers = busRoutes.map(route => route.busNumber).join(","); // Join to create a string for the query

  useEffect(() => {
    setTimeout(() => {
      if (user?.userRole !== "admin") {
        //router.push("/get-started");
      }
    }, 3000);
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, busRoutesResponse, addStudentRequestsResponse, studentStatusResponse] = await Promise.all([
          axios.get('/api/studentCreation', { params: { districtCode: user.userDistrictCode } }),
          axios.get('/api/busRouteCreation', { params: { districtCode: user.userDistrictCode } } ),
          axios.get('/api/studentAddRequest', { params: { districtCode: user.userDistrictCode } }),
          axios.get('/api/studentOnboard', { params: { districtCode: user.userDistrictCode } })
        ]);
        setStudents(studentsResponse.data);
        setBusRoutes(busRoutesResponse.data);
        setRequests(addStudentRequestsResponse.data);
        const students = studentStatusResponse.data.students;
        const boarded = students.filter(student => student.currentNumber % 2 !== 0).length;
        const arrived = students.filter(student => student.status === true).length;
        setStudentsOnboard(boarded);
        setStudentsArrived(arrived);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if(user)
      {
        fetchData()
      }  
  }, [user]);

  // Handle adding a student
  const handleAddStudent = async () => {
    if (!studentName || !studentBirthDate || !studentBusNumber) {
      alert("Please enter a student name and birthdate.");
      console.log(studentName, studentBirthDate, studentBusNumber);
      return;
    }

    try {
      const response = await axios.post('/api/studentCreation', { studentName, studentBirthDate, busNumber: studentBusNumber, districtCode: user.userDistrictCode });
      console.log("Student added successfully:", response.data);
      const studentId = response.data.studentId;
      setStudents([...students, { studentName, studentBirthDate, busNumber:studentBusNumber, studentId }]); // Update student list
      setStudentName(""); // Clear input
      setStudentBirthDate(""); // Clear birthdate
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      console.log("CSV File selected:", file.name);
      // Add logic to parse CSV and add students here
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleApprove = async (requestId, studentId, parentEmail, parentPhoneNumber, parentName) => {
    try {
      const response = await axios.put('/api/studentAddRequest', {
        id: requestId,
        status: 'approved',
        studentId: studentId,
        email: parentEmail,
        phone: parentPhoneNumber,
        parentName: parentName  // Sending parent's name to the API
      });
      if (response.status === 200) {
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === requestId ? { ...request, status: 'approved' } : request
          )
        );
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };
  

  const handleReject = async (requestId) => {
    try {
      const response = await axios.delete('/api/studentAddRequest', {
        data: { id: requestId },
      });
      if (response.status === 200) {
        setRequests(prevRequests => (
          prevRequests.filter(request => request._id !== requestId)
        ));
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // Placeholder function for creating a reminder
  const handleCreateReminder = (e) => {
    e.preventDefault();
    console.log("Reminder created:", reminderText, selectedBuses);
    axios.post("/api//remindersAndAlerts", {
      message: reminderText,
      busNumber: selectedBuses,
      data: new Date().toISOString(),
      time: new Date().toLocaleTimeString()
    })
    .then((response) => {
      console.log("Reminder created successfully:", response.data);
      handleClearReminders();
    })
  };

  // Placeholder function for clearing reminders
  const handleClearReminders = () => {
    setReminderText('');
    setSelectedBuses([]);
    console.log("Reminders cleared");
    
  };

  const handleBusSelect = (e) => {
    const busName = e.target.value;
    if (busName && !selectedBuses.includes(busName)) {
      setSelectedBuses([...selectedBuses, busName]);
      setSelectedBus(''); // Reset the select after adding
    }
  };

  const handleBusRemove = (busToRemove) => {
    setSelectedBuses(selectedBuses.filter(bus => bus !== busToRemove));
  };

  const handleLogout = () => {
    // Clear the token and redirect to the login page
    Cookies.remove('authToken');
    router.push('/');
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


  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "create-route":
        return (
          <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5 w-8 h-8 mr-4"
                >
                  <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
                </svg>

                <h1 className="text-3xl font-bold text-gray-800">Create Route</h1>
              </div>

            <div className=" w-full bg-gray-100 border border-gray-300 rounded-lg shadow-inner">
              <AddBus />
            </div>
          </div>
        );
      case "monitor-buses":
        return (
          <div>
            <AdminHomeGraphs busRoutes={busRoutes}/>
          </div>
        );
        case "add-buses-students":
          return (
<div className="flex flex-col space-y-8">
  {/* Add Buses & Students Form */}
  <div className="p-8 bg-white shadow-lg rounded-lg">
    <span className="flex items-center justify-start">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-8">
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>


      <h2 className="text-3xl font-bold text-gray-900 ml-4">
        Add Students
      </h2>
    </span>


    <div className="space-y-6">
      <div className="mt-4 space-y-4">
        {/* Student Name Input */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
            className="border border-gray-300 p-3 w-full focus:ring-2 focus:ring-blue-500 rounded-md"
          />
        </div>

        {/* Student Birth Date Input */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Birth Date</label>
          <input
            type="date"
            value={studentBirthDate}
            onChange={(e) => setStudentBirthDate(e.target.value)}
            className="border border-gray-300 p-3 w-full focus:ring-2 focus:ring-blue-500 rounded-md"
          />
        </div>

        {/* Select Bus Dropdown */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Select Bus</label>
          <select
            className="border border-gray-300 p-3 w-full focus:ring-2 focus:ring-blue-500 rounded-md"
            onChange={(e) => setStudentBusNumber(e.target.value)} // Changed from onSelect to onChange
            required // Optional: Use this for form validation
          >
            <option value="">Select Bus</option> {/* Optional: Placeholder option */}
            {busRoutes.map((busRoute, index) => (
              <option key={index} value={busRoute.busNumber}>
                {busRoute.busNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Add Student Button */}
        <div>
          <button
            onClick={handleAddStudent}
            className="bg-blue-500 text-white py-2 px-6 w-full hover:bg-blue-600 transition duration-300 ease-in-out rounded-md"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="mt-4">
        <label className="block font-medium text-gray-700 mb-2">Upload CSV for Students</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="border border-gray-300 p-3 w-full focus:ring-2 focus:ring-blue-500 rounded-md"
        />
      </div>
    </div>
  </div>

  {/* Students Table */}
  <div className="p-8 bg-white shadow-lg rounded-lg">
    <StudentsBusesInfo students={students} busRoutes={busRoutes} />
  </div>
</div>

          );        
      case "metrics":
        return (
          <div className="">
            <AdminHomeCharts />
          </div>
        );
        case "settings":
          return (
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Settings</h2>
              
              <div className="bg-gray-50 h-auto border border-gray-300 rounded-lg p-6 mb-6 shadow-sm flex flex-col gap-4">
                <div className="text-center">
                  <span className="text-xl font-semibold text-gray-800">Settings Overview</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md shadow-inner">
                  <h3 className="text-lg font-medium text-gray-600">District Code:</h3>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.userDistrictCode || "Not available"}</h3>
                </div>
              </div>
        
              <button 
                onClick={handleLogout} 
                className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 focus:ring-4 focus:ring-red-300 focus:outline-none"
              >
                Log Out
              </button>
            </div>
          );
        
        case "approve-connections":
          return (
            <div className="p-1 space-y-6">
              {/* Approve Connections Section */}
              <div className="bg-white shadow-md rounded-lg p-8">
              <div className="flex items-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 ml-2">Approve Connections</h2>  
              </div>        
                <div className="grid grid-cols-2 gap-8">
                  {/* Pending Requests */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
                    <div className="space-y-4">
                      {requests.filter(request => request.status === 'pending').length === 0 ? (
                        <p>No pending requests</p>
                      ) : (
                        requests.filter(request => request.status === 'pending').map(request => (
                          <div key={request._id} className="bg-gray-50 border border-gray-300 p-4 rounded-md">
                            <h4 className="font-semibold">{request.name}</h4>
                            <p><strong>Phone:</strong> {request.phone}</p>
                            <p><strong>Email:</strong> {request.email}</p>
                            <p><strong>Date of Birth:</strong> {new Date(request.dateOfBirth).toLocaleDateString()}</p>
                            <p><strong>Address:</strong> {request.address}</p>
                            <p><strong>District Number:</strong> {request.districtNumber}</p>
                            <p><strong>Student ID:</strong> {request.studentId}</p>
                            <p><strong>Status:</strong> {request.status}</p>
                            <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                            <div className="mt-4 flex space-x-4">
                              <button
                              onClick={() => handleApprove(request._id, request.studentId, request.email, request.phone, request.name)}
                              className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 transition duration-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 transition duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
        
              {/* Create Reminders Section */}
              <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Create Reminders</h2>
        
                <form onSubmit={handleCreateReminder}>
                  {/* Preset Reminders */}
                  <div className="mb-4">
                    <label htmlFor="presetReminders" className="block text-gray-700 mb-2">Preset Reminders:</label>
                    <select
                      id="presetReminders"
                      onChange={(e) => setReminderText(e.target.value)}
                      className="border rounded-md w-full p-2"
                    >
                      <option value="">Select a preset message</option>
                      <option value="The bus is delayed by 15 minutes.">Bus Delayed by 15 Minutes</option>
                      <option value="The bus has broken down and will not be in service today.">Bus Broken Down</option>
                      <option value="The bus is running ahead of schedule by 10 minutes.">Bus Ahead by 10 Minutes</option>
                    </select>
                  </div>
        
                  {/* Custom Reminder Text */}
                  <div className="mb-4">
                    <label htmlFor="reminderText" className="block text-gray-700 mb-2">Custom Reminder:</label>
                    <input
                      type="text"
                      id="reminderText"
                      value={reminderText}
                      onChange={(e) => setReminderText(e.target.value)}
                      placeholder="Enter your reminder here..."
                      className="border rounded-md w-full p-2"
                    />
                  </div>
        
                  {/* Bus Selection */}
                  <div className="mb-4">
                    <label htmlFor="busSelect" className="block text-gray-700 mb-2">Select Bus:</label>
                    <select
                      id="busSelect"
                      value={selectedBus}
                      onChange={handleBusSelect}
                      className="border rounded-md w-full p-2"
                    >
                      <option value="">Select a bus</option>
                      {busRoutes.map(bus => (
                        <option key={bus.id} value={bus.name}>{bus.busNumber}</option>
                      ))}
                    </select>
                  </div>
        
                  {/* Selected Buses */}
                  <div className="mb-4">
                    {selectedBuses.map((bus, index) => (
                      <div key={index} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-md py-1 px-3 mr-2 mb-2">
                        {bus}
                        <button
                          type="button"
                          onClick={() => handleBusRemove(bus)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
        
                  {/* Add Reminder Button */}
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    Add Reminder
                  </button>
                </form>
        
                {/* Clear Reminders Button */}
                <button
                  onClick={()=> handleClearReminders()}
                  className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Clear Reminders
                </button>
              </div>
            </div>
          );
        
        default:
          return null;
        }
      }


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gray-800 text-white flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className={`${sidebarOpen ? "block" : "hidden"} text-xl font-bold`}>
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="focus:outline-none"
          >
            <span>{sidebarOpen ? "←" : "→"}</span>
          </button>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setActiveTab("monitor-buses")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "monitor-buses" ? "bg-gray-700" : ""}`}
          >
            Monitor Buses
          </button>
          <button
            onClick={() => setActiveTab("create-route")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "create-route" ? "bg-gray-700" : ""}`}
          >
            Create Route
          </button>
          <button
            onClick={() => setActiveTab("add-buses-students")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "add-buses-students" ? "bg-gray-700" : ""}`}
          >
            Manage Students
          </button>
          <button
            onClick={() => setActiveTab("approve-connections")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "approve-connections" ? "bg-gray-700" : ""}`}
          >
            Parent Side
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "metrics" ? "bg-gray-700" : ""}`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`block w-full text-left p-4 hover:bg-gray-700 ${activeTab === "settings" ? "bg-gray-700" : ""}`}
          >
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-4">
        {renderContent()}
      </main>
    </div>
  );
}
