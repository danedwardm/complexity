from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
app = FastAPI()

# Load the trained models (update the paths as necessary)
rf_fire_level = joblib.load("best_rf_model_for_fire_level_latest_renamed.pkl")  # Replace with actual model path
rf_total = joblib.load("best_rf_model_for_total_latest.pkl")
# Define input data structure (matching training column names)
class InputData(BaseModel):
    Temperature: float
    Wind: float
    Precipitation: float
    Barometer: float
    Weather_Haze: int
    Passing_clouds: int
    Scattered_clouds: int
    Season_Dry: int
    Season_Summer: int
    Season_Wet: int
    Weather_Overcast: int

@app.post("/predict")
def predict(data: InputData):
    try:
        input_dict = data.dict()  # Use .dict() for BaseModel instead of model_dump() (BaseModel has .dict())

        df_test = pd.DataFrame([input_dict])

        fire_columns = [
            'Precipitation', 'Barometer', 'Temperature', 'Wind', 'Season_Summer',
            'Scattered_clouds', 'Weather_Haze', 'Season_Wet',
            'Passing_clouds', 'Season_Dry', 'Weather_Overcast'
        ]
        total_columns = ['Precip_Wind_Interaction', 'Log_Precipitation', 'Temp_Wind_Interaction',
       'Barometer (mbar)', 'Season_Summer', 'Season_Dry', 'Log_Wind', 'Fire Level']
        fire_level = rf_fire_level.predict(df_test[fire_columns])[0]
        df_test['Log_Wind'] = np.log1p(df_test['Wind'])
        df_test['Temp_Wind_Interaction'] = df_test['Temperature'] * df_test['Wind']
        df_test['Precip_Wind_Interaction'] = df_test['Precipitation'] * df_test['Wind']
        df_test['Log_Precipitation'] = np.log1p(df_test['Precipitation'])
        df_test['Fire Level'] = fire_level
        df_test['Barometer (mbar)'] = df_test['Barometer']
        df_test.drop(columns=['Temperature', 'Wind', 'Precipitation'], inplace=True)
          
        df_test = df_test[total_columns] 

       
        df_total_damage = rf_total.predict(df_test)
        # Convert numpy types to native Python types
        fire_level = int(fire_level)  # Convert numpy.int64 to int
        fire_level_class = ["Low", "High"]




        return {
            "fire_level": fire_level_class[fire_level],
            "total": np.expm1(df_total_damage[0]) 
        }

    except Exception as e:
        return {"error": str(e)}
