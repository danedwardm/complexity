import mysql.connector
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained models
rf_fire_level = joblib.load("best_rf_model_for_fire_level_latest_renamed.pkl")
rf_total = joblib.load("best_rf_model_for_total_latest.pkl")


# Database connection function
def connect_to_db(host="localhost", user="root", password="", database="fire_total_prediction"):
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = conn.cursor()
        return conn, cursor
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None, None


# Insertion function
def insert_data_to_db(features, fire_level, total_damage, host="localhost", user="root", password="", database="fire_total_prediction"):
    insert_query = """
    INSERT INTO features (Temperature, Wind, Precipitation, Barometer, Weather_Haze, Passing_clouds, Scattered_clouds,
                          Season_Dry, Season_Summer, Season_Wet, Weather_Overcast, Fire_Level, Total_Damage)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    data_to_insert = (
        features['Temperature'], features['Wind'], features['Precipitation'], features['Barometer'], 
        features['Weather_Haze'], features['Passing_clouds'], features['Scattered_clouds'], features['Season_Dry'], 
        features['Season_Summer'], features['Season_Wet'], features['Weather_Overcast'], fire_level, total_damage
    )
    
    conn, cursor = connect_to_db(host, user, password, database)
    if conn is None or cursor is None:
        print("Database connection failed.")
        return False
    try:
        cursor.execute(insert_query, data_to_insert)
        conn.commit()
        return True
    except mysql.connector.Error as err:
        print(f"Error executing query: {err}")
        return False
    finally:
        cursor.close()
        conn.close()


# Input data model for FastAPI endpoint
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


# Prediction endpoint
@app.post("/predict")
def predict(data: InputData):
    try:
        input_dict = data.dict()  # Convert BaseModel to dictionary

        # Create DataFrame from input data
        df_test = pd.DataFrame([input_dict])

        # Predict fire level using the fire level model
        fire_columns = [
            'Precipitation', 'Barometer', 'Temperature', 'Wind', 'Season_Summer',
            'Scattered_clouds', 'Weather_Haze', 'Season_Wet', 'Passing_clouds', 
            'Season_Dry', 'Weather_Overcast'
        ]
        total_columns = ['Precip_Wind_Interaction', 'Log_Precipitation', 'Temp_Wind_Interaction',
                         'Barometer (mbar)', 'Season_Summer', 'Season_Dry', 'Log_Wind', 'Fire Level']

        fire_level = rf_fire_level.predict(df_test[fire_columns])[0]

        # Ensure that fire_level is within the expected range (0 or 1)
        fire_level_class = ["Low", "High"]
        if fire_level < 0 or fire_level >= len(fire_level_class):
            fire_level = 0  # Default to "Low" if out of bounds

        # Feature engineering for the total damage prediction
        df_test['Log_Wind'] = np.log1p(df_test['Wind'])
        df_test['Temp_Wind_Interaction'] = df_test['Temperature'] * df_test['Wind']
        df_test['Precip_Wind_Interaction'] = df_test['Precipitation'] * df_test['Wind']
        df_test['Log_Precipitation'] = np.log1p(df_test['Precipitation'])
        df_test['Fire Level'] = fire_level
        df_test['Barometer (mbar)'] = df_test['Barometer']
        df_test.drop(columns=['Temperature', 'Wind', 'Precipitation'], inplace=True)
        df_test = df_test[total_columns]

        # Predict total damage
        df_total_damage = rf_total.predict(df_test)

        # Convert numpy types to native Python types
        fire_level = int(fire_level)  # Convert numpy.int64 to int
        
        # Insert data into the database
        insert_success = insert_data_to_db(input_dict, fire_level, np.expm1(df_total_damage[0]))
        
        if not insert_success:
            return {"error": "Failed to insert data into the database"}
        
        # Return the prediction result
        return {
            "fire_level": fire_level_class[fire_level],
            "total_damage": np.expm1(df_total_damage[0])  # Reverse log-transformation
        }

    except Exception as e:
        return {"error": str(e)}
