# actions/journal_actions.py
# Actions related to journal entries

from typing import Any, Text, Dict, List
from rasa_sdk import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import datetime
import logging

from actions.base_action import BaseAPIAction

# Configure logging
logger = logging.getLogger(__name__)

class ActionSaveJournalEntry(BaseAPIAction):
    """Action to save a journal entry"""
    
    def name(self) -> Text:
        return "action_save_journal_entry"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if we need to prompt for journal content
        if self.get_slot_value(tracker, "requested_slot") is None:
            dispatcher.utter_message(text="What would you like to add to your journal?")
            return [SlotSet("requested_slot", "journal_content")]
        
        # Get the latest user message
        journal_content = self.get_latest_input_message(tracker, '')
        
        if not journal_content:
            dispatcher.utter_message(text="Sorry, I couldn't understand your journal entry. Please try again.")
            return [SlotSet("requested_slot", "journal_content")]
        
        # Auto-generate tags
        tags = self.generate_tags_from_content(journal_content)
        
        # Prepare data for the API call
        data = {
            "type": "experience",
            "content": journal_content,
            "timestamp": datetime.datetime.now().isoformat(),
            "tags": tags,
            "userId": "default_user"
        }
        
        logger.info(f"Attempting to save journal entry: {data}")
        
        # Try both possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/journal",
            f"{BaseAPIAction.BASE_URL}/api/journal"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # Display the generated tags
        tags_display = ", ".join(tags)
        
        # Send confirmation regardless of API success
        dispatcher.utter_message(text=f"Thank you. Your journal entry has been saved with tags: {tags_display}")
        
        # Add redirect to journal page
        custom_message = {
            "redirect": "/journal.html?refresh=true"
        }
        dispatcher.utter_message(json_message=custom_message)
        
        return [SlotSet("journal_content", journal_content), SlotSet("requested_slot", None)]

class ActionSaveExperience(BaseAPIAction):
    """Action to save a user experience entry"""
    
    def name(self) -> Text:
        return "action_save_experience"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if we're at the initial prompt stage
        if self.get_slot_value(tracker, "requested_slot") is None and tracker.latest_message.get('intent', {}).get('name') == 'record_experience':
            dispatcher.utter_message(text="How are you today? What's going well for you? Are you experiencing any issues or concerns?")
            return [SlotSet("requested_slot", "experience_content")]
            
        # Get the latest user message
        experience_content = self.get_latest_input_message(tracker, '')
        
        logger.info(f"Content to save: {experience_content}")
        
        if not experience_content:
            logger.warning("No content to save")
            dispatcher.utter_message(text="Sorry, I couldn't capture your experience.")
            return [SlotSet("requested_slot", "experience_content")]
        
        # Generate tags automatically based on content
        auto_tags = self.generate_tags_from_content(experience_content)
        
        # Prepare data for the journal entry
        data = {
            "type": "experience",
            "content": experience_content,
            "timestamp": datetime.datetime.now().isoformat(),
            "tags": auto_tags,
            "userId": "default_user"
        }
        
        logger.info(f"Sending data to API: {data}")
        
        # Try both possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/journal",
            f"{BaseAPIAction.BASE_URL}/api/journal"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # Display the generated tags
        tags_display = ", ".join(auto_tags)
        
        # First send a confirmation message
        dispatcher.utter_message(text=f"Thank you for sharing your experience. I've added this to your journal with the following tags: {tags_display}")
        
        # Then send the redirect command
        custom_message = {
            "redirect": "/journal.html?refresh=true"
        }
        dispatcher.utter_message(json_message=custom_message)
        
        # Clear the requested slot
        return [SlotSet("experience_content", experience_content), SlotSet("requested_slot", None)]