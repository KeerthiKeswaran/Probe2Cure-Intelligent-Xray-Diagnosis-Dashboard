# Probe2Cure: Intelligent X-ray Diagnosis Dashboard

## Overview

**Probe2Cure** is an advanced web-based application designed to facilitate intelligent diagnosis of X-ray images. The dashboard allows users to upload X-ray images, analyze them using a deep learning model, and visualize the results through intuitive charts and heatmaps. It also provides AI-driven suggestions based on the diagnosis through an integrated Large Language Model (LLM).

### Website

[Probe2Cure Dashboard](https://keerthikeswaran.github.io/Probe2Cure-Intelligent-Xray-Diagnosis-Dashboard/)

https://github.com/user-attachments/assets/53eb5ac0-3065-4ec8-b489-12b65f9372e8
---

## Features

1. **User-Friendly Interface**
   - Responsive design with an intuitive layout for seamless navigation.
   - File upload functionality for X-ray images.
   - Visual display of diagnosis results, heatmaps, and historical data.

2. **X-ray Analysis**
   - Upload X-ray files and initiate diagnosis through an integrated AI model.
   - Display diagnosis predictions along with confidence scores.

3. **Data Visualization**
   - Interactive pie charts for diagnosis results.
   - Line charts representing the historical accuracy of diagnoses over time.
   - Heatmap visualization of X-ray images for better interpretability.

4. **Diagnosis History**
   - Store and display previous diagnosis results for comparison.
   - Visualize historical accuracy data with line charts.

5. **AI-Driven Suggestions**
   - Utilizes LLM (Llama-3.1-70B-versatile) to generate actionable insights and suggestions based on diagnosis.
   - Typing animation to enhance user experience during response display.

---

## Architecture

### Frontend (React)

The frontend is developed using **React**, which manages the user interface and facilitates interaction with the backend.

- **Components**:
  - `Dashboard.jsx`: Main component for the dashboard, handling file uploads, displaying results, and integrating charts.
  - `About.jsx`: Contains information about the application and its creators.
  - UI libraries: Utilizes **Bootstrap** for styling and **Material-UI** for circular progress indicators.

- **State Management**: Uses React hooks (`useState`, `useEffect`) to manage application state, including file uploads, loading indicators, diagnosis data, and historical records.

#### Key Functionalities in `Dashboard.jsx`

- **File Upload**: Allows users to upload X-ray images, which are processed for diagnosis.
- **Diagnosis Process**: 
  - Initiates an API call to the backend upon file upload.
  - Processes the response to display diagnosis results and generate a heatmap image.
- **Typing Animation**: Gradually displays suggestions from the LLM to enhance user engagement.

### Backend (FastAPI)

The backend is implemented using **FastAPI**, providing RESTful endpoints for image upload and diagnosis processing.

- **Endpoints**:
  - `POST /upload`: Accepts uploaded X-ray images and returns diagnosis predictions and heatmaps.
  - `POST /suggestion`: Generates suggestions based on the diagnosis using the integrated LLM.

#### Key Components in `main.py`

- **Model Initialization**: Loads a pre-trained TensorFlow model (`RadiantModel-xs.h5`) for X-ray image classification.
- **CORS Middleware**: Configures CORS settings to allow cross-origin requests from the frontend.

- **LLM Integration**: Utilizes a **LLama-3.1** from open source service called **Chat-Groq**, to provide detailed and contextual suggestions based on diagnosis results.

---

## Data Processing Flow

1. **File Upload**: The user uploads an X-ray image via the dashboard.
2. **Diagnosis Request**: The frontend sends a request to the `/upload` endpoint with the image.
3. **Model Prediction**:
   - The backend processes the image using the loaded TensorFlow model.
   - The model generates predictions and associated heatmaps.
4. **Data Visualization**:
   - The backend sends the prediction results back to the frontend.
   - The frontend displays the results in the dashboard, including pie charts and heatmaps.
5. **Suggestion Generation**:
   - The latest diagnosis is sent to the `/suggestion` endpoint.
   - The LLM processes the diagnosis and provides suggestions.
   - The suggestions are displayed in a typing format for user engagement.

---

## Technical Requirements

### Frontend

- **React**: A JavaScript library for building user interfaces.
- **Axios**: A promise-based HTTP client for making requests to the backend.
- **Chart.js**: A JavaScript library for creating interactive charts.

### Backend

- **FastAPI**: A modern web framework for building APIs with Python.
- **TensorFlow**: An open-source platform for machine learning.
- **Pydantic**: Data validation and settings management using Python type annotations.

---

## Deployment

So far the application has been deployed in github pages. The backend will be deployed on cloud service on the specified port (default: `8000`) and that CORS is appropriately configured to allow requests from the frontend.

---

## Conclusion

**Probe2Cure** represents a significant advancement in the field of medical imaging diagnostics, combining state-of-the-art machine learning techniques with user-friendly design. Its integration with a Large Language Model provides users with contextual insights that aid in interpreting diagnosis results, making it a valuable tool for healthcare professionals.

---

### Contact

For any inquiries or contributions, please reach out via the contact information provided on the website.
