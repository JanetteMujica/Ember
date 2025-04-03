# actions/utility_actions.py
# Utility actions for managing slots, redirects, and various helpers

from typing import Any, Text, Dict, List
from rasa_sdk import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, AllSlotsReset
import requests
import logging

from actions.base_action import BaseAPIAction, BaseAction

# Configure logging
logger = logging.getLogger(__name__)

class ActionResetSlots(BaseAction):
    """Action to reset all slots"""
    
    def name(self) -> Text:
        return "action_reset_slots"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Reset all slots to their default values
        return [AllSlotsReset()]

class ActionShowAllCategories(BaseAction):
    """Action to show all available tracking categories"""
    
    def name(self) -> Text:
        return "action_show_all_categories"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # For a real implementation, you might want to fetch this from a database
        taxonomy = """
1) Physical Health (Movement & Body Functions)
   a) Moving & Walking: Tremors, Rigidity, Bradykinesia, Postural/gait impairment
   b) Body Reactions & sensations: Pain, Orthostatic hypotension, Sweating Problems, Skin Problems
   c) Bladder, Digestion & Swallowing: Constipation, Urinary Issues, Swallowing Problems, Saliva Control, Eating Problems
   d) Sleep disorders & Fatigue: Insomnia, Daytime sleepiness, Restless Legs, Fatigue
   e) Sensory Changes: Loss of smell, Vision Problems, Abnormal sensations

2) Mental Health (Mood, Emotions & Thinking)
   a) Feeling worried or anxious: Anxiety, Panic Attack, Impulse control, Apathy, Depression
   b) Thinking & Memory: Memory Problems, Cognitive Changes, Difficulty focusing
   c) Seeing or hearing things: Hallucinations, Delusions, Illusions

3) Lifestyle & Well-Being
   a) Staying Active: Exercise & Physical activity, Hobbies
   b) Social Life & Relationship: Living Alone, Intimacy, Sexuality
   c) Diet & Nutrition: Weight, Nutrition advices
   d) Managing Daily Tasks: Reorganizing Home, Using Assistive Tools, Adapting Routines
   e) Medication & Treatment: Managing medication, Understanding side effects, Information about new treatments
        """
        
        dispatcher.utter_message(text="Here is the full taxonomy of aspects you can track:")
        dispatcher.utter_message(text=taxonomy)
        
        return []

class ActionGetCurrentCategories(BaseAction):
    """Action to get the current categories being tracked"""
    
    def name(self) -> Text:
        return "action_get_current_categories"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the currently tracked categories from the slot
        current_categories = self.get_slot_value(tracker, "selected_categories", [])
        
        # Filter out any special values
        current_categories = [cat for cat in current_categories if cat != "active"]
        
        if not current_categories:
            dispatcher.utter_message(text="You're not currently tracking any categories.")
        else:
            categories_text = ", ".join(current_categories)
            dispatcher.utter_message(text=f"You're currently tracking: {categories_text}")
        
        # Set the requested_slot for the next action
        return [SlotSet("requested_slot", "update_category")]

class ActionUpdateCategories(BaseAPIAction):
    """Action to update tracking categories"""
    
    def name(self) -> Text:
        return "action_update_categories"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        update_action = self.get_latest_input_message(tracker, "").lower()
        current_categories = self.get_slot_value(tracker, "selected_categories", [])
        
        # Filter out any special values
        current_categories = [cat for cat in current_categories if cat != "active"]
        
        if "remove" in update_action or "delete" in update_action:
            # Extract the category name to remove
            parts = update_action.split()
            for i, part in enumerate(parts):
                if part in ["remove", "delete"] and i+1 < len(parts):
                    category_to_remove = parts[i+1]
                    if category_to_remove in current_categories:
                        current_categories.remove(category_to_remove)
                        dispatcher.utter_message(text=f"Removed '{category_to_remove}' from your tracking categories.")
                    else:
                        dispatcher.utter_message(text=f"You're not currently tracking '{category_to_remove}'.")
                    break
        else:
            dispatcher.utter_message(text="I couldn't understand which category to update. Please try again.")
        
        # Try to save the updated categories to both possible endpoints
        data = {
            "categories": current_categories,
            "userId": "default_user"
        }
        
        # Try both possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/user-preferences",
            f"{BaseAPIAction.BASE_URL}/api/user-preferences"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        return [
            SlotSet("selected_categories", current_categories),
            SlotSet("requested_slot", None)
        ]

class ActionRedirectToVisualize(BaseAction):
    """Action to redirect to visualization page"""
    
    def name(self) -> Text:
        return "action_redirect_to_visualize"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Send a message with JavaScript to redirect the page
        dispatcher.utter_message(text="Taking you to your visualizations...")
        dispatcher.utter_message(json_message={"redirect": "/visualize.html"})
        
        return []

class ActionRedirectToJournal(BaseAction):
    """Action to redirect to journal page"""
    
    def name(self) -> Text:
        return "action_redirect_to_journal"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Send a message with JavaScript to redirect the page
        dispatcher.utter_message(text="Taking you to your journal...")
        dispatcher.utter_message(json_message={"redirect": "/journal.html"})
        
        return []