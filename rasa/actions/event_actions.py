# actions/event_actions.py
# Actions related to event recording (medication, symptoms, etc.)

from typing import Any, Text, Dict, List
from rasa_sdk import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import datetime
import logging

from actions.base_action import BaseAPIAction

# Configure logging
logger = logging.getLogger(__name__)

class ActionSaveMedicationEvent(BaseAPIAction):
    """Action to save medication change events"""
    
    def name(self) -> Text:
        return "action_save_medication_event"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if we are just prompting for input
        if self.get_slot_value(tracker, "requested_slot") is None:
            # Set the requested slot to mark what kind of input we're expecting
            dispatcher.utter_message(text="Please describe the medication change (name, dosage, timing, etc.):")
            return [SlotSet("requested_slot", "medication_details")]
            
        # Get the latest user message
        medication_details = self.get_latest_input_message(tracker, '')
        
        logger.info(f"Got medication details: {medication_details}")
        
        if not medication_details:
            dispatcher.utter_message(text="Sorry, I couldn't understand the medication details. Please try again.")
            return [SlotSet("requested_slot", "medication_details")]
        
        # Prepare data for the API call
        data = {
            "type": "event",
            "eventType": "medication_change",
            "content": medication_details,
            "timestamp": datetime.datetime.now().isoformat(),
            "userId": "default_user",
            "tags": ["medication", "health"]
        }
        
        logger.info(f"Attempting to save medication event: {data}")
        
        # Try both possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/journal",
            f"{BaseAPIAction.BASE_URL}/api/journal"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # First send confirmation even if API call failed
        dispatcher.utter_message(text="I've recorded your medication change in your journal.")
        
        # Then redirect
        custom_message = {
            "redirect": "/journal.html?refresh=true"
        }
        dispatcher.utter_message(json_message=custom_message)
        
        # Clear the requested slot after processing
        return [SlotSet("medication_details", medication_details), SlotSet("requested_slot", None)]

class ActionSaveNewSymptom(BaseAPIAction):
    """Action to save new symptom events"""
    
    def name(self) -> Text:
        return "action_save_new_symptom"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if we need to prompt for symptom details first
        if self.get_slot_value(tracker, "requested_slot") is None and tracker.latest_message.get('intent', {}).get('name') == 'new_symptom':
            dispatcher.utter_message(text="Please describe your new symptom in detail:")
            return [SlotSet("requested_slot", "symptom_details")]
            
        # Get the latest user message as the symptom details
        symptom_details = self.get_latest_input_message(tracker, '')
        
        logger.info(f"Got symptom details: {symptom_details}")
        
        if not symptom_details:
            dispatcher.utter_message(text="Sorry, I couldn't understand your symptom details. Please try again.")
            return [SlotSet("requested_slot", "symptom_details")]
        
        # Prepare data for the API call
        data = {
            "type": "event",
            "eventType": "new_symptom",
            "content": symptom_details,
            "timestamp": datetime.datetime.now().isoformat(),
            "tags": ["symptom", "health"],
            "userId": "default_user"
        }
        
        logger.info(f"Attempting to save new symptom: {data}")
        
        # Try both possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/journal",
            f"{BaseAPIAction.BASE_URL}/api/journal"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # First send confirmation even if API call failed
        dispatcher.utter_message(text="I've recorded your new symptom in your journal.")
        
        # Then redirect
        custom_message = {
            "redirect": "/journal.html?refresh=true"
        }
        dispatcher.utter_message(json_message=custom_message)
        
        # Clear the requested slot
        return [SlotSet("symptom_details", symptom_details), SlotSet("requested_slot", None)]

class ActionSaveOtherEvent(BaseAPIAction):
    """Action to save other types of events"""
    
    def name(self) -> Text:
        return "action_save_other_event"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Special handling for when the inform intent is triggered directly after record_event
        # This handles the case when a user selects "Other Event" from the options
        if (self.get_slot_value(tracker, "requested_slot") is None and 
            tracker.latest_message.get('intent', {}).get('name') == 'inform' and
            len(tracker.events) >= 2 and
            tracker.events[-2].get('name') == 'utter_record_event_options'):
            dispatcher.utter_message(text="Please provide a short description of the event:")
            return [SlotSet("requested_slot", "event_details")]
        
        # Normal handling when we need to prompt for event details
        if self.get_slot_value(tracker, "requested_slot") is None:
            dispatcher.utter_message(text="Please provide a short description of the event:")
            return [SlotSet("requested_slot", "event_details")]
            
        # Get the event details if the requested slot is set
        if self.get_slot_value(tracker, "requested_slot") == "event_details":
            # Get the latest user message
            event_details = self.get_latest_input_message(tracker, '')
            
            logger.info(f"Got event details: {event_details}")
            
            if not event_details:
                dispatcher.utter_message(text="Sorry, I couldn't understand your event details. Please try again.")
                return [SlotSet("requested_slot", "event_details")]
            
            # Prepare data for the API call
            data = {
                "type": "event",
                "eventType": "other",
                "content": event_details,
                "timestamp": datetime.datetime.now().isoformat(),
                "tags": ["event"],
                "userId": "default_user"
            }
            
            logger.info(f"Attempting to save other event: {data}")
            
            # Try both possible endpoints
            endpoints = [
                f"{BaseAPIAction.BASE_URL}/journal",
                f"{BaseAPIAction.BASE_URL}/api/journal"
            ]
            
            success, response = self.make_api_call(endpoints, data)
            
            # First send confirmation even if API call failed
            dispatcher.utter_message(text="I've recorded this event in your journal.")
            
            # Then redirect
            custom_message = {
                "redirect": "/journal.html?refresh=true"
            }
            dispatcher.utter_message(json_message=custom_message)
            
            # Clear the requested slot
            return [SlotSet("event_details", event_details), SlotSet("requested_slot", None)]
        
        # If we get here, something unexpected happened
        dispatcher.utter_message(text="I'm not sure what to do next. Let's start over.")
        return [SlotSet("requested_slot", None)]