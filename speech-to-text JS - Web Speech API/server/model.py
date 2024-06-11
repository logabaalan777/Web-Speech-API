import google.generativeai as genai
import json

genai.configure(api_key='AIzaSyCmPlSpjYkUXH95-1oMRNs7QzSRFRe-A4E')
model = genai.GenerativeModel('gemini-1.0-pro')

def get_ans(query):
    template = ''' 
    Input: show me red sarees under Rs. 1000" and show in the following format. 
    output:
            {
            "prompt":"show me green saree under Rs 500",
            "action_intent": "search",
            "num_items":"10000",
            "filters":
                {
                "category_name":"Saree",
                "brand_name":"",
                    "price_min": "0",
                    "price_max": "500",
                    "provider_name": "",
                    "query_entity_type": "product",
                    "colour": "green",
                    "size":""
                }
            }
            
            here is another example 
            
            {
            "prompt":"show me red shirts under Rs 1000",
            "action_intent": "search",
            "num_items":"10000",
            "filters":
                {
                "category_name":"shirts",
                "brand_name":"",
                    "price_min": "0",
                    "price_max": "1000",
                    "provider_name": "",
                    "query_entity_type": "product",
                    "colour": "red",
                    "size":""
                }
            }
            likewise provide json formatted data only for upcoming data for all colors either its shirts, sarees, etc... always you need to give the parsed data for the response
    '''
    output = model.generate_content(template + query)

    response_text = output.text.strip()
    
    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError as e:
        return {"error": "Failed to parse response from model.", "details": str(e)}
    
    return response_json
