import React, { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { CircularProgress } from "@mui/material"; // Import loading indicator
import './Page.css'; // Ensure this imports your CSS

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [heatmapImage, setHeatmapImage] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleStartDiagnose = async () => {
    setLoading(true); // Start loading
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDiagnosisData(response.data);
      setHeatmapImage(`data:image/png;base64,${response.data.heatmap}`); // Set the heatmap image
    } catch (error) {
      console.error("Error during diagnosis", error);
    }
    setLoading(false); // End loading
  };

  return (
    <div className="container">
      <div className="navbar">
        <div className="logo">
          <img style={{ width: "40px" }} src="img/recycling.png" alt="Logo" />
          <span className="logoname">Probe2Cure Dashboard</span>
        </div>

        <div className="searchbox">
          <form>
            <input type="text" placeholder="Search" />
            <i className="fa fa-search"></i>
          </form>
        </div>
      </div>

      <div className="container-body">
        {/* Upload Section */}
        <div className="upload-section">
          <input type="file" onChange={handleFileUpload} className="file-input" />
          <button onClick={handleStartDiagnose} className="diagnose-button">Start Diagnose</button>
        </div>

        {/* Show loader when processing */}
        {loading && (
          <div className="loading">
            <CircularProgress color="inherit" />
          </div>
        )}

        {/* Render diagnosis results */}
        {diagnosisData && !loading && (
          <div className="results-section">
            <div className="card">
              <h3>Diagnosis Results</h3>
              <p><strong>Diagnosis:</strong> {diagnosisData.prediction}</p>
              <p><strong>Confidence:</strong> {diagnosisData.accuracy}%</p>

              {/* Graphs */}
              <div className="charts">
                <Chart
                  type="pie"
                  series={[diagnosisData.accuracy, 100 - diagnosisData.accuracy]}
                  options={{
                    labels: ["Accuracy", "Other"],
                    colors: ['#66BB6A', '#FF7043'],
                    legend: {
                      position: 'bottom',
                      markers: {
                        radius: 12,
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Display the heatmap image */}
            {heatmapImage && (
              <div className="card heatmap-section">
                <h3>Diagnosis Heatmap</h3>
                <img src={heatmapImage} alt="Heatmap" className="heatmap-image" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
