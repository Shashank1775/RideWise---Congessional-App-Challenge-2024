import { useState } from 'react';
import axios from 'axios';

const StudentsBusesInfo = ({ students, busRoutes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editedField, setEditedField] = useState('');
  const [editedValue, setEditedValue] = useState('');
  const [studentsData, setStudentsData] = useState(students);

  // Calculate current students based on pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = studentsData
    .filter(student => student.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(indexOfFirstStudent, indexOfLastStudent);

  // Handle pagination change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages for pagination
  const totalPages = Math.ceil(studentsData.filter(student => student.studentName.toLowerCase().includes(searchTerm.toLowerCase())).length / studentsPerPage);

  // Handle edit start
  const handleEditStart = (index, field) => {
    setEditIndex(index);
    setEditedField(field);
    setEditedValue(currentStudents[index][field]);
  };

  // Handle edit save
  const handleEditSave = (index) => {
    const updatedStudents = [...studentsData];
    updatedStudents[indexOfFirstStudent + index][editedField] = editedValue;
    const updatedValue = updatedStudents[indexOfFirstStudent + index];
    axios.put('/api/studentCreation', {
        studentId: updatedValue.studentId,
        studentName: updatedValue.studentName,
        studentBirthDate: updatedValue.studentBirthDate,
        busNumber: updatedValue.busNumber
    });
    console.log(updatedStudents[indexOfFirstStudent + index]);
    setStudentsData(updatedStudents);
    setEditIndex(-1);
    setEditedField('');
    setEditedValue('');
  };

  // Handle delete
  const handleDelete = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (confirmDelete) {
      const updatedStudents = studentsData.filter((_, i) => i !== indexOfFirstStudent + index);
      setStudentsData(updatedStudents);
    }
  };

  return (
    <div className="">
      <span className="flex items-center justify-start p-4 hover:shadow-lg transition-shadow duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 "
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 ml-4">
          Students & Buses Information
        </h2>
      </span>


      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for students..."
          className="border border-gray-300 p-2 w-full rounded"
        />
      </div>

      {/* Students Table */}
      <table className="w-full table-auto bg-gray-50 border border-gray-300 shadow-lg mb-8">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-4 border">Student Name</th>
            <th className="p-4 border">Birth Date</th>
            <th className="p-4 border">Student ID</th>
            <th className="p-4 border">Bus Number</th>
            <th className="p-4 border">Actions</th>
            <th className='p-4 border'>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.map((student, index) => (
            <tr key={index} className="text-center border-t">
              <td className="p-4 border" onDoubleClick={() => handleEditStart(index, 'studentName')}>
                {editIndex === index && editedField === 'studentName' ? (
                  <input
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={() => handleEditSave(index)}
                    className="border border-gray-300 p-1"
                  />
                ) : (
                  student.studentName
                )}
              </td>
              <td className="p-4 border" onDoubleClick={() => handleEditStart(index, 'studentBirthDate')}>
                {editIndex === index && editedField === 'studentBirthDate' ? (
                  <input
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={() => handleEditSave(index)}
                    className="border border-gray-300 p-1"
                  />
                ) : (
                  student.studentBirthDate
                )}
              </td>
              <td className="p-4 border" onDoubleClick={() => handleEditStart(index, 'studentId')}>
                {editIndex === index && editedField === 'studentId' ? (
                  <input
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={() => handleEditSave(index)}
                    className="border border-gray-300 p-1"
                  />
                ) : (
                  student.studentId
                )}
              </td>
              <td className="p-4 border" onDoubleClick={() => handleEditStart(index, 'busNumber')}>
                {editIndex === index && editedField === 'busNumber' ? (
                  <select
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={() => handleEditSave(index)}
                    className="border border-gray-300 p-1"
                  >
                    <option value="">Select Bus Number</option>
                    {busRoutes.map(bus => (
                      <option key={bus.busNumber} value={bus.busNumber}>{bus.busNumber}</option>
                    ))}
                  </select>
                ) : (
                  student.busNumber
                )}
              </td>
              <td className="p-4 border">
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
              {/* TO COME */}
              <td className="p-4  items-center flex justify-center">
                <div className={`w-6 h-6 ${student.status ? 'bg-green-500' : 'bg-red-500'} rounded-full`}>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between mb-4">
        <button
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => paginate(currentPage + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Buses Table */}
      <table className="w-full table-auto bg-gray-50 border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-4 border">Bus Number</th>
            <th className="p-4 border">Number of Students</th>
            <th className="p-4 border">Number of Stops</th>
          </tr>
        </thead>
        <tbody>
          {busRoutes.map((bus, index) => (
            <tr key={index} className="text-center border-t">
              <td className="p-4 border">{bus.busNumber}</td>
              <td className="p-4 border">{studentsData.filter((student) => student.busNumber === bus.busNumber).length}</td>
              <td className="p-4 border">{bus.routeStops.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsBusesInfo;
