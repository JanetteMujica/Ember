# actions/tracking_actions.py
# Actions related to tracking care priorities

from typing import Any, Text, Dict, List
from rasa_sdk import Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import datetime
import logging

from actions.base_action import BaseAPIAction, BaseAction

# Configure logging
logger = logging.getLogger(__name__)

class ActionSaveTrackingPreferences(BaseAPIAction):
    """Action to save user's tracking preferences"""
    
    def name(self) -> Text:
        return "action_save_tracking_preferences"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get slot values
        category = self.get_slot_value(tracker, "category")
        frequency = self.get_slot_value(tracker, "frequency")
        time = self.get_slot_value(tracker, "time")
        
        # Validate required fields
        if not category or not frequency or not time:
            dispatcher.utter_message(text="Sorry, I couldn't save your tracking preferences. Please try again.")
            return []
        
        # Prepare data for the API call
        data = {
            "category": category,
            "frequency": frequency,
            "time": time,
            "userId": "default_user"  # In a real app, you'd get this from authentication
        }
        
        logger.info(f"Attempting to save tracking preferences: {data}")
        
        # Try to save the preferences
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/tracking-preferences",
            f"{BaseAPIAction.BASE_URL}/api/tracking-preferences"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # Update the selected_categories slot
        current_categories = self.get_slot_value(tracker, "selected_categories", [])
        if category not in current_categories:
            current_categories.append(category)
        
        # Confirm the category has been added
        dispatcher.utter_message(text=f"I've set up tracking for {category} {frequency} at {time}.")
        
        # Return slot updates
        return [
            SlotSet("selected_categories", current_categories),
            SlotSet("category", "active")  # Mark as active for rules to work
        ]

class ActionSaveTrackingEntry(BaseAPIAction):
    """Action to save a tracking entry with severity rating"""
    
    def name(self) -> Text:
        return "action_save_tracking_entry"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get severity from the latest user message
        severity = self.get_latest_entity_value(tracker, "severity")
        if not severity:
            # Try to extract a number from the input as fallback
            import re
            user_input = self.get_latest_input_message(tracker, "")
            severity_match = re.search(r'\d+', user_input)
            severity = severity_match.group(0) if severity_match else None
        
        # Get category from slot
        category = self.get_slot_value(tracker, "category")
        
        if not category or not severity:
            dispatcher.utter_message(text="Sorry, I couldn't save your tracking entry. Please try again.")
            return []
        
        # Prepare data for the API call
        data = {
            "category": category,
            "severity": int(severity),
            "timestamp": datetime.datetime.now().isoformat(),
            "userId": "default_user"
        }
        
        logger.info(f"Attempting to save tracking entry: {data}")
        
        # Try multiple possible endpoints
        endpoints = [
            f"{BaseAPIAction.BASE_URL}/entries",
            f"{BaseAPIAction.BASE_URL}/api/entries",
            f"{BaseAPIAction.BASE_URL}/pain-entries",
            f"{BaseAPIAction.BASE_URL}/api/pain-entries"
        ]
        
        success, response = self.make_api_call(endpoints, data)
        
        # Get the current categories being tracked and remove the current one
        current_categories = self.get_slot_value(tracker, "selected_categories", [])
        remaining_categories = [cat for cat in current_categories if cat != category and cat != "active"]
        
        # First send confirmation
        dispatcher.utter_message(text=f"Thank you for tracking your {category}. This information will help identify patterns over time.")
        
        # If there are remaining categories to track, ask the user if they want to track now
        if remaining_categories:
            # Set the next category
            next_category = remaining_categories[0]
            
            dispatcher.utter_message(
                text=f"You also set up tracking for {next_category}. Would you like to track it now?",
                buttons=[
                    {"title": "Yes", "payload": f"/select_tracking_category{{\"category\":\"{next_category}\"}}"},
                    {"title": "No, take me to visualizations", "payload": "/view_visualizations"}
                ]
            )
            return [
                SlotSet("category", next_category), 
                SlotSet("requested_slot", None),
                SlotSet("selected_categories", remaining_categories)
            ]
        else:
            # If no more categories to track, redirect to visualization
            dispatcher.utter_message(text="Taking you to the visualization page to see your data.")
            custom_message = {
                "redirect": "/visualize.html?refresh=true"
            }
            dispatcher.utter_message(json_message=custom_message)
            return [
                SlotSet("requested_slot", None),
                SlotSet("selected_categories", [])
            ]

class ActionSelectTrackingCategory(BaseAction):
    """Action to handle selection of a tracking category"""
    
    def name(self) -> Text:
        return "action_select_tracking_category"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Extract category from entity
        category = self.get_latest_entity_value(tracker, "category")
        
        if not category:
            dispatcher.utter_message(text="I didn't understand which category you want to track. Could you try again?")
            return []
        
        # Now it's safe to use the category in a template
        dispatcher.utter_message(text=f"You've selected to track {category}.")
        
        # Continue with the next step in the flow
        dispatcher.utter_message(
            text=f"How often would you like to track {category}?",
            buttons=[
                {"title": "Daily", "payload": "/set_tracking_frequency{\"frequency\":\"daily\"}"},
                {"title": "Twice a day", "payload": "/set_tracking_frequency{\"frequency\":\"twice a day\"}"},
                {"title": "Weekly", "payload": "/set_tracking_frequency{\"frequency\":\"weekly\"}"},
                {"title": "Custom", "payload": "/inform"}
            ]
        )
        
        # Set the category slot
        return [SlotSet("category", category)]

class ActionSetTrackingFrequency(BaseAction):
    """Action to set the frequency for tracking a category"""
    
    def name(self) -> Text:
        return "action_set_tracking_frequency"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get frequency from entity or direct input
        frequency = self.get_latest_entity_value(tracker, "frequency")
        
        # If no entity found, check if it was a direct text input
        if not frequency:
            frequency = self.get_latest_input_message(tracker)
        
        logger.info(f"Got frequency: {frequency}")
        
        if not frequency:
            dispatcher.utter_message(text="Sorry, I couldn't understand your preferred tracking frequency. Please try again.")
            return []
        
        # Get the category
        category = self.get_slot_value(tracker, "category")
        
        # Continue the conversation flow
        dispatcher.utter_message(
            text=f"At what time would you like to be reminded to track {category}?",
            buttons=[
                {"title": "Morning (9 AM)", "payload": "/set_tracking_time{\"time\":\"9am\"}"},
                {"title": "Afternoon (2 PM)", "payload": "/set_tracking_time{\"time\":\"2pm\"}"},
                {"title": "Evening (8 PM)", "payload": "/set_tracking_time{\"time\":\"8pm\"}"},
                {"title": "Custom", "payload": "/inform"}
            ]
        )
        
        # Set the frequency slot
        return [SlotSet("frequency", frequency)]

class ActionSetTrackingTime(BaseAction):
    """Action to set the time for tracking a category"""
    
    def name(self) -> Text:
        return "action_set_tracking_time"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get time from entity or direct input
        time = self.get_latest_entity_value(tracker, "time")
        
        # If no entity found, check if it was a direct text input
        if not time:
            time = self.get_latest_input_message(tracker)
        
        logger.info(f"Got time: {time}")
        
        if not time:
            dispatcher.utter_message(text="Sorry, I couldn't understand your preferred tracking time. Please try again.")
            return []
        
        # Get category and frequency
        category = self.get_slot_value(tracker, "category")
        frequency = self.get_slot_value(tracker, "frequency")
        
        if not category or not frequency:
            dispatcher.utter_message(text="Sorry, I'm missing some information. Let's start over.")
            return [SlotSet("time", time)]
        
        # Confirm the tracking setup
        dispatcher.utter_message(text=f"Great! I've set up tracking for {category} {frequency} at {time}.")
        
        # Set the time slot
        return [SlotSet("time", time)]

class ActionRateSeverity(BaseAction):
    """Action to rate the severity of a tracked category"""
    
    def name(self) -> Text:
        return "action_rate_severity"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get severity from entity
        severity = self.get_latest_entity_value(tracker, "severity")
        
        if not severity:
            dispatcher.utter_message(text="Sorry, I couldn't understand your severity rating. Please try again on a scale of 1-5.")
            return []
        
        # Get the category being tracked
        category = self.get_slot_value(tracker, "category")
        
        # Confirm the severity rating
        dispatcher.utter_message(text=f"Thank you for rating your {category} as {severity} out of 5.")
        
        # Set the severity slot
        return [SlotSet("severity", severity)]

class ActionStartTracking(BaseAction):
    """Action to start the tracking process for a category"""
    
    def name(self) -> Text:
        return "action_start_tracking"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the current category to track
        category = self.get_slot_value(tracker, "category")
        
        if not category or category == "active":
            dispatcher.utter_message(text="I'm not sure which category you want to track. Let's start over.")
            return [SlotSet("requested_slot", None)]
        
        # Ask for severity rating
        dispatcher.utter_message(
            text=f"Please rate your current {category} level (1-5):",
            buttons=[
                {"title": "1 (Minimal)", "payload": f"/rate_severity{{\"severity\":\"1\"}}"},
                {"title": "2 (Mild)", "payload": f"/rate_severity{{\"severity\":\"2\"}}"},
                {"title": "3 (Moderate)", "payload": f"/rate_severity{{\"severity\":\"3\"}}"},
                {"title": "4 (Significant)", "payload": f"/rate_severity{{\"severity\":\"4\"}}"},
                {"title": "5 (Severe)", "payload": f"/rate_severity{{\"severity\":\"5\"}}"}
            ]
        )
        
        return []

class ActionHandleAdditionalCategory(BaseAction):
    """Action to handle the user's choice about adding more categories to track"""
    
    def name(self) -> Text:
        return "action_handle_additional_category"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if user affirmed or denied adding another category
        last_intent = tracker.latest_message.get('intent', {}).get('name', '')
        
        if last_intent == 'affirm':
            # User wants to add another category, redirect back to categories selection
            dispatcher.utter_message(text="Let's add another category to track.")
            dispatcher.utter_message(
                text="Which category would you like to track?",
                buttons=[
                    {"title": "Physical Health", "payload": "/select_physical_health"},
                    {"title": "Mental Health", "payload": "/select_mental_health"},
                    {"title": "Lifestyle & Well-Being", "payload": "/select_lifestyle"}
                ]
            )
            # Reset category to prevent conflicts
            return [SlotSet("category", None)]
            
        elif last_intent == 'deny':
            # User doesn't want to add more categories, ask if they want to track now
            # Get all the categories that have been set up
            current_categories = self.get_slot_value(tracker, "selected_categories", [])
            
            # Filter out 'active' if it's in the list
            current_categories = [cat for cat in current_categories if cat != 'active']
            
            if current_categories:
                # Take the first category for tracking
                first_category = current_categories[0]
                
                # Ask if they want to track now
                return [
                    SlotSet("category", first_category),
                    SlotSet("selected_categories", current_categories)
                ]
            else:
                # No categories set up yet, redirect to main options
                dispatcher.utter_message(text="You haven't set up any categories to track yet.")
                dispatcher.utter_message(
                    text="What would you like to do?",
                    buttons=[
                        {"title": "Set up tracking", "payload": "/track_daily_life"},
                        {"title": "Record an event", "payload": "/record_event"},
                        {"title": "Write in journal", "payload": "/record_experience"}
                    ]
                )
                return []
        else:
            # Unexpected intent, provide general options
            dispatcher.utter_message(text="I'm not sure what you'd like to do next.")
            dispatcher.utter_message(
                text="What would you like to do?",
                buttons=[
                    {"title": "Set up tracking", "payload": "/track_daily_life"},
                    {"title": "Record an event", "payload": "/record_event"},
                    {"title": "Write in journal", "payload": "/record_experience"}
                ]
            )
            return []

class ActionAddCustomCategory(BaseAction):
    """Action to add a custom tracking category"""
    
    def name(self) -> Text:
        return "action_add_custom_category"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Check if we are just asking for input
        if self.get_slot_value(tracker, "requested_slot") is None:
            dispatcher.utter_message(text="What custom category would you like to add?")
            return [SlotSet("requested_slot", "custom_category")]
            
        # Get the latest user message to extract the custom category
        custom_category = self.get_latest_input_message(tracker, '')
        
        if not custom_category:
            dispatcher.utter_message(text="Sorry, I couldn't understand the custom category. Please try again.")
            return [SlotSet("requested_slot", "custom_category")]
        
        # Update the selected_categories slot
        current_categories = self.get_slot_value(tracker, "selected_categories", [])
        if custom_category not in current_categories:
            current_categories.append(custom_category)
        
        # Now we can use the category in messages
        dispatcher.utter_message(text=f"I've added '{custom_category}' as a new tracking category.")
        
        # Ask about tracking frequency for this custom category
        dispatcher.utter_message(
            text=f"How often would you like to track {custom_category}?",
            buttons=[
                {"title": "Daily", "payload": "/set_tracking_frequency{\"frequency\":\"daily\"}"},
                {"title": "Twice a day", "payload": "/set_tracking_frequency{\"frequency\":\"twice a day\"}"},
                {"title": "Weekly", "payload": "/set_tracking_frequency{\"frequency\":\"weekly\"}"},
                {"title": "Custom", "payload": "/inform"}
            ]
        )
        
        # Set the category slots
        return [
            SlotSet("custom_category", custom_category),
            SlotSet("category", custom_category),
            SlotSet("selected_categories", current_categories),
            SlotSet("requested_slot", None)
        ]

class ActionAskTrackNow(BaseAction):
    """Action to ask the user if they want to track a category now"""
    
    def name(self) -> Text:
        return "action_ask_track_now"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        category = self.get_slot_value(tracker, "category")
        
        if not category or category == "active":
            dispatcher.utter_message(text="I'm not sure which category you want to track.")
            return []
        
        dispatcher.utter_message(
            text=f"Would you like to track {category} now?",
            buttons=[
                {"title": "Yes", "payload": "/affirm"},
                {"title": "No", "payload": "/deny"}
            ]
        )
        
        return []

class ActionFinalizeTracking(BaseAction):
    """Action to finalize the tracking process"""
    
    def name(self) -> Text:
        return "action_finalize_tracking"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get any categories that might be left to track
        remaining_categories = self.get_slot_value(tracker, "selected_categories", [])
        
        # Get the current category that was just tracked
        current_category = self.get_slot_value(tracker, "category")
        
        # Filter out special values and the current category
        remaining_categories = [cat for cat in remaining_categories 
                                if cat != "active" and cat != current_category]
        
        if remaining_categories:
            next_cat = remaining_categories[0]
            dispatcher.utter_message(
                text=f"Would you like to track {next_cat} now or go to visualizations?",
                buttons=[
                    {"title": f"Track {next_cat}", "payload": f"/select_tracking_category{{\"category\":\"{next_cat}\"}}"},
                    {"title": "Go to visualizations", "payload": "/view_visualizations"}
                ]
            )
            return [SlotSet("selected_categories", remaining_categories)]
        else:
            dispatcher.utter_message(text="All categories have been tracked. Taking you to visualizations.")
            custom_message = {
                "redirect": "/visualize.html?refresh=true"
            }
            dispatcher.utter_message(json_message=custom_message)
            return [SlotSet("selected_categories", [])]