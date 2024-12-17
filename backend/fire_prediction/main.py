import psycopg2  # PostgreSQL connector
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
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

# PostgreSQL database configuration
DB_CONFIG = {
    "dbname": os.getenv('DB_NAME', 'fire_prediction_postgre'), 
    "user": os.getenv('DB_USER', 'fire_prediction_postgre_user'), 
    "password": os.getenv('DB_PASSWORD', 'ZMTVQZrOI69VOeH8jMHjvtQypwmsAgIi'), 
    "host": os.getenv('DB_HOST', 'dpg-ctgj3vl2ng1s738j7d60-a.singapore-postgres.render.com'), 
    "port": int(os.getenv('DB_PORT', 5432)),  # Default to 5432 if not set
}
# Function to get a new database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        return conn, cursor
    except psycopg2.Error as err:
        print(f"Error connecting to the database: {err}")
        return None, None

def insert_data_to_db(cursor, conn, features, fire_level, total_damage):
    insert_query = """
    INSERT INTO features (Temperature, Wind, Precipitation, Barometer, Weather_Haze, Passing_clouds, Scattered_clouds,
                          Season_Dry, Season_Summer, Season_Wet, Weather_Overcast, Fire_Level, Total_Damage)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # Convert numpy.float64 to native Python float
    data_to_insert = (
        float(features['Temperature']), float(features['Wind']), float(features['Precipitation']), float(features['Barometer']),
        int(features['Weather_Haze']), int(features['Passing_clouds']), int(features['Scattered_clouds']), int(features['Season_Dry']),
        int(features['Season_Summer']), int(features['Season_Wet']), int(features['Weather_Overcast']),
        int(fire_level), float(total_damage)
    )

    try:
        cursor.execute(insert_query, data_to_insert)
        conn.commit()
        return True, "Data inserted successfully"  # Return both success and message
    except psycopg2.Error as err:
        conn.rollback()  # Rollback the failed transaction
        print(f"Error executing query: {err.pgerror}")
        return False, f"Error executing query: {err.pgerror}"  # Return error message



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

        # Predict fire level
        fire_columns = [
            'Precipitation', 'Barometer', 'Temperature', 'Wind', 'Season_Summer',
            'Scattered_clouds', 'Weather_Haze', 'Season_Wet', 'Passing_clouds',
            'Season_Dry', 'Weather_Overcast'
        ]
        fire_level = rf_fire_level.predict(df_test[fire_columns])[0]
        fire_level_class = ["Low", "High"]
        fire_level = int(fire_level)  # Ensure it’s an int

        # Feature engineering for total damage prediction
        df_test['Log_Wind'] = np.log1p(df_test['Wind'])
        df_test['Temp_Wind_Interaction'] = df_test['Temperature'] * df_test['Wind']
        df_test['Precip_Wind_Interaction'] = df_test['Precipitation'] * df_test['Wind']
        df_test['Log_Precipitation'] = np.log1p(df_test['Precipitation'])
        df_test['Fire Level'] = fire_level
        df_test['Barometer (mbar)'] = df_test['Barometer']
        total_columns = ['Precip_Wind_Interaction', 'Log_Precipitation', 'Temp_Wind_Interaction',
                         'Barometer (mbar)', 'Season_Summer', 'Season_Dry', 'Log_Wind', 'Fire Level']
        df_total = df_test[total_columns]

        # Predict total damage
        df_total_damage = rf_total.predict(df_total)
        total_damage = np.expm1(df_total_damage[0])  # Reverse log-transform

        # Get database connection and cursor
        conn, cursor = get_db_connection()
        if conn is None or cursor is None:
            return {"error": "Database connection failed."}

        # Insert into the database
        success, message = insert_data_to_db(cursor, conn, input_dict, fire_level, total_damage)
        if not success:
            return {"error": message}

        # Close the database connection
        cursor.close()
        conn.close()

        # Return prediction results
        return {
            "fire_level": fire_level_class[fire_level],
            "total_damage": total_damage
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
