from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
from model import get_ans

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

logging.basicConfig(level=logging.DEBUG)

@app.route('/api/query', methods=['POST'])  # type: ignore
def query():
    if 'Content-Type' in request.headers and request.headers['Content-Type'] == 'application/json':
        data = request.json
        transcript = data.get('transcript')  # type: ignore
        if not transcript:
            app.logger.error("No transcript provided.")
            return jsonify({"error": "No transcript provided."}), 400
        
        response = get_ans(transcript)
        app.logger.debug(f"Processed response: {response}")
        
        try:
            external_response = requests.post(
                'https://cartesian-api.plotch.io/recommender/fetch',
                headers={'Content-Type': 'application/json'},
                json=response
            )
            external_response.raise_for_status()  
            external_data = external_response.json()
            app.logger.debug(f"External API response: {external_data}")
            return jsonify(external_data)
        except requests.exceptions.RequestException as e:
            app.logger.error(f"Error while forwarding to external API: {str(e)}")
            app.logger.debug(f"Request data: {response}")
            if e.response:
                app.logger.debug(f"External API response content: {e.response.text}")
            return jsonify({"error": str(e)}), 500
    else:
        app.logger.error("Unsupported Media Type. Content-Type must be 'application/json'.")
        return jsonify({"error": "Unsupported Media Type. Content-Type must be 'application/json'."}), 415

if __name__ == '__main__':
    app.run(debug=True)
