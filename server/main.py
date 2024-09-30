
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import numpy as np
from PIL import Image
import tensorflow as tf
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)
tf.compat.v1.losses.sparse_softmax_cross_entropy
import matplotlib.pyplot as plt
import base64
from initializePipeline import init_pipeline
from fastapi import FastAPI, HTTPException
import logging
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



model = tf.keras.models.load_model("RadiantModel-xs.h5")
dummy_input = np.zeros((1, 150, 150, 3))
_ = model(dummy_input)  
print("CNN Initialized !!")

responseModel = init_pipeline()
print("Initialized LLM !!")

class_label =  ['Covid', 'Normal', 'Viral Pneumonia']

class Suggest(BaseModel):
    diagnose : str
    accuracy : str
    
@app.post("/suggestion")
async def semantic_search(req : Suggest):
    print(type(req.diagnose))
    print(type(req.accuracy))
    try:
        diagnose_result = req.diagnose
        diagnose_accuracy = req.accuracy
        
        # Invoke the response model
        response = response = responseModel.invoke({
                    "diagnose_result": str(diagnose_result),
                    "diagnose_accuracy": str(diagnose_accuracy)
                    })

        # Check if response content is valid
        if not response or not response.content:
            raise ValueError("Invalid response from the model.")
        
        return {"results": str(response.content)}
    
    except AttributeError as e:
        logging.error(f"AttributeError: {e}")
        raise HTTPException(status_code=422, detail="Invalid request body")
    except ValueError as ve:
        logging.error(f"ValueError: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error during model invocation: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")


@app.post("/upload")
async def diagnose(file: UploadFile = File(...)):
    # Read image data
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert('RGB')

    image = image.resize((150,150)) 
    image_pred = np.array([np.array(image)])
    predicted = model.predict(image_pred)
    predicted_label = class_label[np.argmax(predicted)]
    accuracy = np.max(predicted) * 100  
    heatmap = make_gradcam_heatmap(image_pred, model, "conv2d_3")
    heatmap_image_base64 = convert_heatmap_to_base64(heatmap)
    return {"prediction": str(predicted_label), "accuracy": round(accuracy,2),"heatmap": heatmap_image_base64}

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    grad_model = tf.keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]

    grads = tape.gradient(class_channel, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
    return heatmap

def convert_heatmap_to_base64(heatmap):
    plt.imshow(heatmap, cmap='hot')
    plt.axis('off') 

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close() 
    buf.seek(0)

    heatmap_image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return heatmap_image_base64

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
