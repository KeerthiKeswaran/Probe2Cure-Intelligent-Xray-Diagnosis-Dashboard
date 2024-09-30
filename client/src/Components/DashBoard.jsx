import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { CircularProgress } from "@mui/material";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import About from './About';
import logo from '../assets/Websitelogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faChartPie, faImage, faHistory, faLightbulb } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [heatmapImage, setHeatmapImage] = useState(null);
  const [xrayImage, setXrayImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosisHistory, setDiagnosisHistory] = useState({});
  const [llmResponse, setLlmResponse] = useState(""); 
  const [typedResponse, setTypedResponse] = useState("");
  const [diagnosisStarted, setDiagnosisStarted] = useState(false); 
  const [typingIndex, setTypingIndex] = useState(0); 
  const typingSpeed = 3;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setXrayImage(reader.result);
    };

    setHeatmapImage(null);
    reader.readAsDataURL(file);
  };

  const preprocessText = (text) => {
    let formattedText = String(text)
    let responseArray = formattedText.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }
    let pattern = /\*/g;
    let replacement = "</br><b>•</b> "; // Replacement string
    let newResponse2 = newResponse.replace(pattern, replacement);
    pattern = /(\r?\n\s*){2,}/g;
    replacement = "</br> ";
    newResponse2 = newResponse2.replace(pattern, replacement);
    pattern = /- <b>/g;
    replacement = "</br> - <b> ";
    newResponse2 = newResponse2.replace(pattern, replacement);
    return newResponse2;
  };

  const handleStartDiagnose = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData,{
        method : 'POST',

        headers: { "Content-Type": "multipart/form-data" },
      });

      setDiagnosisData(response.data);
      setHeatmapImage(`data:image/png;base64,${response.data.heatmap}`);

      const latestDiagnosis = response.data.prediction;
      const latestAccuracy = response.data.accuracy;
      const date = new Date().toLocaleDateString();

      setDiagnosisHistory(prevHistory => {
        const updatedHistory = { ...prevHistory };
        if (!updatedHistory[latestDiagnosis]) {
          updatedHistory[latestDiagnosis] = [];
        }
        updatedHistory[latestDiagnosis].push({ date, accuracy: latestAccuracy });
        return updatedHistory;
      });

      try {
        const response = await axios.post("http://127.0.0.1:8000/suggestion",
          {
            diagnose: latestDiagnosis,
            accuracy: String(latestAccuracy)
          }, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
        });
        const text = preprocessText(response.data.results);
        setDiagnosisStarted(true);
        setLlmResponse(text);

        setTypedResponse("");
        setTypingIndex(0);
      } catch (error) {
        const text = "An error occurred while generating suggestions. Meanwhile, please interpret the available data until the issue is resolved.";
        console.error("Error fetching LLM response", error);
      }

    } catch (error) {
      console.error("Error during diagnosis", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (diagnosisStarted && typingIndex < llmResponse.length) {
      const typingTimeout = setTimeout(() => {
        setTypedResponse((prev) => prev + llmResponse[typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    }
  }, [typingIndex, diagnosisStarted, llmResponse]);

  const generateChartData = (diagnosis) => {
    const data = diagnosisHistory[diagnosis] || [];
    return {
      series: [{
        name: `${diagnosis} Accuracy`,
        data: data.map(item => item.accuracy),
      }],
      options: {
        chart: {
          type: 'line',
          height: 350,
        },
        xaxis: {
          categories: data.map(item => item.date),
        },
        title: {
          text: `${diagnosis} History`,
          align: 'center',
          style: {
            color: '#ffffff',
          },
        },
        stroke: {
          curve: 'smooth',
        },
        markers: {
          size: 0,
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        toolbar: {
          show: true,
          tools: {
            download: '<span class="download-icon">⬇️</span>',
            zoom: false,
            zoomin: false,
            zoomout: false,
            selection: false,
            pan: false,
            reset: false,
          },
        },
      },
    };
  };

  return (
    <>
      <div className="container-fluid dashboard-container">
        <div className="logoMobile d-flex align-items-center mb-4">
          <img src={logo} alt="Logo" />
        </div>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-2 sidebar">
            <div className="logo d-flex align-items-center mb-4">
              <img src={logo} alt="Logo" />
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">Home</li>
              <li className="nav-item">Dashboard</li>
              <li className="nav-item">Settings</li>
            </ul>
          </div>

          <div className="col-md-10 main-content">
            <h1 className="text-center mb-4" style={{ fontWeight: '800', fontSize: '30px' }}>Probe2Cure Dashboard</h1>

            <div className="upload-section text-center mb-4">
              <input type="file" onChange={handleFileUpload} className="form-control-file mb-3" style={{ borderRadius: '7px' }} />
              <button onClick={handleStartDiagnose} className="btn btn-primary">
                <FontAwesomeIcon icon={faFileUpload} className="custicon"/> Start Diagnose
              </button>
            </div>

            {loading && (
              <div className="d-flex justify-content-center my-4">
                <CircularProgress color="inherit" />
              </div>
            )}

            <div className="row charts-section">
              <div className="col-md-6 mb-4">
                <div className="card p-3">
                  <h3 style={{ fontWeight: '600' }}>
                    <FontAwesomeIcon icon={faChartPie} /> Diagnosis Results
                  </h3>
                  {diagnosisData ? (
                    <>
                      <p style={{ color: 'white' }}><strong>Diagnosis:</strong> {diagnosisData.prediction}</p>
                      <p style={{ color: 'white' }}><strong>Confidence:</strong> {diagnosisData.accuracy}%</p>
                      <div className="charts mt-3">
                        <Chart
                          type="pie"
                          series={[diagnosisData.accuracy, 100 - diagnosisData.accuracy]}
                          options={{
                            labels: ["Accuracy", "Other"],
                            colors: ['#66BB6A', '#FF7043'],
                            legend: {
                              show: false,
                            },
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#888999' }}>No diagnosis data yet. Please upload a file to start.</p>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card p-3">
                  <h3 style={{ fontWeight: '600' }}>
                    <FontAwesomeIcon icon={faImage} /> Heatmap
                  </h3>
                  {heatmapImage ? (
                    <img src={heatmapImage} alt="Heatmap" className="img-fluid" />
                  ) : (
                    <p style={{ color: '#888999' }}>Heatmap will be available after diagnosis.</p>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card p-3">
                  <h3 style={{ color: '#ff7043', fontWeight: '800' }}>
                    <FontAwesomeIcon icon={faHistory} /> Diagnosis History
                  </h3>
                  {Object.keys(diagnosisHistory).length > 0 ? (
                    <div className="history-list">
                      {Object.keys(diagnosisHistory).map(diagnosis => (
                        <div key={diagnosis} className="history-item">
                          <Chart
                            options={{
                              ...generateChartData(diagnosis).options,
                              colors: ['#ff7043'],
                              xaxis: {
                                labels: {
                                  style: {
                                    colors: '#ffffff',
                                  },
                                },
                              },
                              yaxis: {
                                labels: {
                                  style: {
                                    colors: '#ffffff',
                                  },
                                },
                              },

                              tooltip: {
                                theme: 'dark',
                              },
                            }}
                            series={generateChartData(diagnosis).series}
                            type="line"
                            height={350}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#888999' }}>No diagnosis history available.</p>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card p-3">
                  <h3 style={{ color: '#ff7043', fontWeight: '800' }}>
                    <FontAwesomeIcon icon={faLightbulb} /> Suggestions (Llama.3.1)
                  </h3>
                  <p style={{
                    color: '#888999',
                    backgroundColor: 'black',
                    borderRadius: '5px',
                    fontSize: '14px',
                    padding: '10px'
                  }}>
                    {diagnosisStarted ?
                      (
                        <div style={{
                          color: diagnosisStarted ? "white" : "#888999"
                        }}
                          dangerouslySetInnerHTML={{ __html: typedResponse }}>
                        </div>
                      ) : "Please start the diagnosis to see suggestions."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <About />
      </div>
    </>
  );
};

export default Dashboard;
