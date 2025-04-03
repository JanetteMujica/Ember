# actions/base_action.py
# Base classes for actions to reduce code duplication

from typing import Any, Text, Dict, List, Tuple, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import json
import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base URL for the Node.js backend
BASE_URL = "http://localhost:5000"  # Changed from "http://localhost:5000/api"

class BaseAction(Action):
    """Base class for all actions"""
    
    def name(self) -> Text:
        """
        Required method that all Action subclasses must implement.
        This default implementation SHOULD be overridden by subclasses.
        """
        raise NotImplementedError("Action subclass must implement name() method")
    
    def get_slot_value(self, tracker: Tracker, slot_name: Text, default_value=None) -> Any:
        """Helper method to safely get slot values"""
        value = tracker.get_slot(slot_name)
        if value is None:
            return default_value
        return value
    
    def get_latest_entity_value(self, tracker: Tracker, entity_name: Text, default_value=None) -> Any:
        """Helper method to safely get the latest entity value"""
        entity_value = next(tracker.get_latest_entity_values(entity_name), None)
        if entity_value is None:
            return default_value
        return entity_value
    
    def get_latest_input_message(self, tracker: Tracker, default_value=None) -> Text:
        """Helper method to get the latest user input text"""
        for event in reversed(tracker.events):
            if event.get('event') == 'user':
                return event.get('text', default_value)
        return default_value

class BaseAPIAction(BaseAction):
    """Base class for actions that make API calls"""
    
    # Set the BASE_URL as a class attribute for referencing in child classes
    BASE_URL = BASE_URL
    
    def make_api_call(self, endpoints: List[Text], data: Dict[Text, Any], timeout: int = 10) -> Tuple[bool, Optional[requests.Response]]:
        """Make API call to multiple possible endpoints with error handling
        
        Args:
            endpoints: List of endpoint URLs to try
            data: Data to send in the request
            timeout: Request timeout in seconds
            
        Returns:
            Tuple (success, response)
        """
        try:
            for endpoint in endpoints:
                try:
                    logger.info(f"Trying endpoint: {endpoint}")
                    response = requests.post(endpoint, json=data, timeout=timeout)
                    logger.info(f"Response status: {response.status_code}")
                    
                    if response.status_code == 200 or response.status_code == 201:
                        return True, response
                except Exception as e:
                    logger.error(f"Error with endpoint {endpoint}: {str(e)}")
                    continue
            return False, None
        except Exception as e:
            logger.error(f"Final API error: {str(e)}")
            return False, None
            
    def generate_tags_from_content(self, content: Text) -> List[Text]:
        """Generate tags based on content keywords"""
        if not content:
            return ["untagged"]
            
        auto_tags = ["daily_check_in"]
        
        # Simple keyword-based tag generation
        keywords = {
            "pain": "pain",
            "tired": "fatigue",
            "exhausted": "fatigue",
            "fatigue": "fatigue",
            "sleep": "sleep",
            "insomnia": "sleep",
            "anxiety": "anxiety",
            "worried": "anxiety",
            "stress": "stress",
            "medication": "medication",
            "meds": "medication",
            "tremor": "tremor",
            "shake": "tremor",
            "shaking": "tremor",
            "mood": "mood",
            "happy": "mood",
            "sad": "mood",
            "depression": "depression",
            "exercise": "exercise",
            "walk": "exercise",
            "walking": "mobility",
            "balance": "balance",
            "fall": "balance",
            "dizzy": "dizziness",
            "memory": "cognitive",
            "forget": "cognitive",
            "thinking": "cognitive",
            "rigidity": "rigidity",
            "stiff": "rigidity"
        }
        
        # Check for keywords in the content and add corresponding tags
        lower_content = content.lower()
        for keyword, tag in keywords.items():
            if keyword in lower_content and tag not in auto_tags:
                auto_tags.append(tag)
                
        return auto_tags