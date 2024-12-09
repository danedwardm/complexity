import requests

url = "http://127.0.0.1:8000/predict"
data = {
    "Temperature": 30.5,
    "Wind": 15.0,
    "Precipitation": 10.0,
    "Barometer": 1012.0,
    "Weather_Haze": 1,
    "Passing_clouds": 0,
    "Scattered_clouds": 1,
    "Season_Dry": 0,
    "Season_Summer": 1,
    "Season_Wet": 0,
    "Weather_Overcast": 0
}

response = requests.post(url, json=data)

# Check the status code to ensure the request was successful
if response.status_code == 200:
    try:
        print(response.json())  # Print the JSON response
    except ValueError:
        print("Response content is not valid JSON")
else:
    print(f"Request failed with status code {response.status_code}")
    print(f"Response: {response.text}")
