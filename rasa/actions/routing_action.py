# actions/routing_action.py
# Routing action to handle all inform intents based on slot conditions

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ActionInformRouter(Action):
    """
    This is a router action that handles all inform intents and routes them
    to the appropriate action based on the requested_slot.
    """
    
    def name(self) -> Text:
        """Return the name of this action"""
        return "action_inform_router"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the requested slot
        requested_slot = tracker.get_slot("requested_slot")
        logger.info(f"ActionInformRouter received inform with requested_slot={requested_slot}")
        
        # Route to the appropriate action based on the requested_slot
        if requested_slot == "medication_details":
            logger.info("Routing to action_save_medication_event")
            return self.route_to_action("action_save_medication_event", dispatcher, tracker, domain)
            
        elif requested_slot == "symptom_details":
            logger.info("Routing to action_save_new_symptom")
            return self.route_to_action("action_save_new_symptom", dispatcher, tracker, domain)
            
        elif requested_slot == "update_category":
            logger.info("Routing to action_update_categories")
            return self.route_to_action("action_update_categories", dispatcher, tracker, domain)
            
        elif requested_slot == "journal_content":
            logger.info("Routing to action_save_journal_entry")
            return self.route_to_action("action_save_journal_entry", dispatcher, tracker, domain)
            
        elif requested_slot == "event_details":
            logger.info("Routing to action_save_other_event")
            return self.route_to_action("action_save_other_event", dispatcher, tracker, domain)
            
        elif requested_slot == "experience_content":
            logger.info("Routing to action_save_experience")
            return self.route_to_action("action_save_experience", dispatcher, tracker, domain)
            
        elif requested_slot == "custom_category":
            logger.info("Routing to action_add_custom_category")
            return self.route_to_action("action_add_custom_category", dispatcher, tracker, domain)
            
        else:
            logger.warning(f"No routing rule for requested_slot={requested_slot}")
            dispatcher.utter_message(text="I'm not sure what information you're providing. How can I help you?")
            return []
    
    def route_to_action(self, action_name: Text, dispatcher: CollectingDispatcher, 
                        tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        """Route to another action by instantiating and running it directly"""
        
        # Find the action class
        for action in domain.get("actions", []):
            if action == action_name:
                # Import the action dynamically
                from actions import (
                    ActionSaveMedicationEvent,
                    ActionSaveNewSymptom,
                    ActionUpdateCategories,
                    ActionSaveJournalEntry,
                    ActionSaveOtherEvent,
                    ActionSaveExperience,
                    ActionAddCustomCategory
                )
                
                # Map action names to classes
                action_map = {
                    "action_save_medication_event": ActionSaveMedicationEvent,
                    "action_save_new_symptom": ActionSaveNewSymptom,
                    "action_update_categories": ActionUpdateCategories,
                    "action_save_journal_entry": ActionSaveJournalEntry,
                    "action_save_other_event": ActionSaveOtherEvent,
                    "action_save_experience": ActionSaveExperience,
                    "action_add_custom_category": ActionAddCustomCategory
                }
                
                # Instantiate and run the action
                if action_name in action_map:
                    action_class = action_map[action_name]
                    action_instance = action_class()
                    return action_instance.run(dispatcher, tracker, domain)
                
                break
        
        logger.error(f"Could not find action {action_name} in domain")
        return []