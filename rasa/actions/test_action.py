from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import logging

logger = logging.getLogger(__name__)

class ActionTest(Action):
    def name(self) -> Text:
        return "action_test"
        
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        logger.info("ActionTest is running!")
        
        # Log the last intent
        last_intent = tracker.latest_message.get('intent', {}).get('name', 'unknown')
        
        # Log all slots
        slots = {slot: tracker.get_slot(slot) for slot in tracker.slots}
        
        # Print useful debug info
        logger.info(f"Last intent: {last_intent}")
        logger.info(f"Slots: {slots}")
        logger.info(f"Last action: {tracker.latest_action_name}")
        logger.info(f"Latest message: {tracker.latest_message}")
        
        # Send debug message to user
        dispatcher.utter_message(text=f"Debug: Last intent was '{last_intent}'")
        dispatcher.utter_message(text=f"Debug: Current slots: {slots}")
        
        return []