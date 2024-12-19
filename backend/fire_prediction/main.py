import psycopg2  # PostgreSQL connector
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from datetime import timedelta, datetime
import jwt
# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = os.getenv("SECRET_KEY", "asdasrvqq231233evaweaswd")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30



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

USER_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    address TEXT NOT NULL
)
"""


def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET TIMEZONE = 'Asia/Manila';")
        conn.commit()
        return conn, cursor
    except psycopg2.Error as err:
        print(f"Error connecting to the database: {err}")
        return None, None
    
conn, cursor = get_db_connection()
if cursor:
    cursor.execute(USER_TABLE)
    conn.commit()
    cursor.close()
    conn.close()

def hash_password(password:str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def insert_data_to_db(cursor, conn, features, fire_level, total_damage):
    insert_query = """
    INSERT INTO features (Temperature, Wind, Precipitation, Barometer, Weather_Haze, Passing_clouds, Scattered_clouds,
                          Season_Dry, Season_Summer, Season_Wet, Weather_Overcast, Fire_Level, Total_Damage, location)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # Convert input to compatible types
    data_to_insert = (
        float(features['Temperature']), float(features['Wind']), float(features['Precipitation']),
        float(features['Barometer']), int(features['Weather_Haze']), int(features['Passing_clouds']),
        int(features['Scattered_clouds']), int(features['Season_Dry']), int(features['Season_Summer']),
        int(features['Season_Wet']), int(features['Weather_Overcast']), int(fire_level),
        float(total_damage), features['location']
    )

    try:
        cursor.execute(insert_query, data_to_insert)
        conn.commit()
        return True, "Data inserted successfully"
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return False, f"Integrity error: {err.pgerror}"
    except psycopg2.Error as err:
        conn.rollback()
        return False, f"Database error: {err.pgerror}"




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
    location: str

class RegisterUser(BaseModel):
    username: str
    email: EmailStr
    address: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterUser):
    conn, cursor = get_db_connection()

    if conn is None or cursor is None:
        raise HTTPException(status_code=500, detail="Database connection is NONE")
    
    hashed_password = hash_password(user.password)

    try:
      cursor.execute(
          "INSERT INTO users (username, email, hashed_password, address) values (%s, %s, %s, %s)",
          (user.username, user.email, hashed_password, user.address)
      )
      conn.commit()
    except psycopg2.IntegrityError as e:
      conn.rollback()
      raise HTTPException(status_code=400, detail="User already exists")
    finally:
      cursor.close()
      conn.close()

    return {"message": "User registered successfully"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn, cursor = get_db_connection()
    if conn is None or cursor is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor.execute("SELECT id, hashed_password FROM users WHERE username = %s", (form_data.username,))
        user = cursor.fetchone()
        if not user or not verify_password(form_data.password, user[1]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
    finally:
        cursor.close()
        conn.close()

    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer", "username": form_data.username}

@app.post("/predict")
def predict(data: InputData, token: str = Depends(oauth2_scheme)):
    try:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username is None:
                raise HTTPException(status_code=401, detail="Invalid authentication token")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
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
    
@app.get("/features")
def get_features(token: str = Depends(oauth2_scheme)):
    try:
        # Verify JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    # Get database connection
    conn, cursor = get_db_connection()
    if conn is None or cursor is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # Fetch all records from the features table (remove LIMIT to show all data)
        cursor.execute("SELECT * FROM features  ORDER BY report_date DESC")  
        rows = cursor.fetchall()
        
        # Format the data into a dictionary list
        feature_data = [
            {
                "Temperature": row[1], "Wind": row[2], "Precipitation": row[3], "Barometer": row[4],
                "Weather_Haze": row[5], "Passing_clouds": row[6], "Scattered_clouds": row[7],
                "Season_Dry": row[8], "Season_Summer": row[9], "Season_Wet": row[10], "Weather_Overcast": row[11],
                "Fire_Level": row[12], "Total_Damage": row[13], "report_date": row[14], "location": row[15]
            }
            for row in rows
        ]
    finally:
        cursor.close()
        conn.close()

    return feature_data

