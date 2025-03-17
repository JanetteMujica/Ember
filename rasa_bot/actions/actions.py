from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import json
import datetime
import os
from dotenv import load_dotenv

# Load environment variables for API keys
load_dotenv()
IBM_PAIN_API_KEY = os.getenv("IBM_PAIN_API_KEY")
IBM_PAIN_API_URL = os.getenv("IBM_PAIN_API_URL", "https://api.digitalhealth.ibm.com/pain-states/api/v1")

class ActionSubmitPainData(Action):
    def name(self) -> Text:
        return "action_submit_pain_data"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get all slots containing pain data
        pain_intensity = tracker.get_slot("pain_intensity")
        pain_location = tracker.get_slot("pain_location")
        pain_quality = tracker.get_slot("pain_quality")
        pain_duration = tracker.get_slot("pain_duration")
        pain_triggers = tracker.get_slot("pain_triggers")
        pain_relievers = tracker.get_slot("pain_relievers")
        sleep_quality = tracker.get_slot("sleep_quality")
        mood_state = tracker.get_slot("mood_state")
        activity_level = tracker.get_slot("activity_level")
        
        # Create timestamp for pain report
        timestamp = datetime.datetime.now().isoformat()
        
        # Prepare data for IBM Pain States API
        pain_data = {
            "timestamp": timestamp,
            "patient_id": tracker.sender_id,  # Using RASA sender_id as patient identifier
            "assessment_type": "self_reported",
            "pain_data": {
                "intensity": pain_intensity,
                "locations": pain_location,
                "qualities": pain_quality,
                "duration": pain_duration,
                "triggers": pain_triggers,
                "relievers": pain_relievers
            },
            "context_data": {
                "sleep_quality": sleep_quality,
                "mood_state": mood_state,
                "activity_level": activity_level
            }
        }
        
        try:
            # Submit data to IBM Pain States API
            headers = {
                "Content-Type": "application/json",
                "x-ibm-client-id": IBM_PAIN_API_KEY
            }
            
            response = requests.post(
                f"{IBM_PAIN_API_URL}/patient-reports",
                headers=headers,
                json=pain_data
            )
            
            if response.status_code == 200 or response.status_code == 201:
                # Store the report ID for future reference
                report_id = response.json().get("report_id", "unknown")
                dispatcher.utter_message(text="Your pain information has been successfully recorded.")
                return [SlotSet("assessment_complete", True), SlotSet("report_id", report_id)]
            else:
                dispatcher.utter_message(text="There was an issue saving your pain information. "
                                             "Your data has been saved locally.")
                # For now, let's save locally as a fallback
                with open(f"pain_reports/{tracker.sender_id}_{timestamp}.json", "w") as f:
                    json.dump(pain_data, f)
                return [SlotSet("assessment_complete", True)]
                
        except Exception as e:
            # Handle exceptions and provide user-friendly messages
            dispatcher.utter_message(text="I'm having trouble connecting to our systems. "
                                         "Your information has been saved locally and will be uploaded later.")
            # Save locally as a fallback
            os.makedirs("pain_reports", exist_ok=True)
            with open(f"pain_reports/{tracker.sender_id}_{timestamp}.json", "w") as f:
                json.dump(pain_data, f)
            return [SlotSet("assessment_complete", True)]


class ActionGeneratePainReport(Action):
    def name(self) -> Text:
        return "action_generate_pain_report"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get all slots containing pain data for the report
        pain_intensity = tracker.get_slot("pain_intensity")
        pain_location = tracker.get_slot("pain_location") or []
        pain_quality = tracker.get_slot("pain_quality") or []
        pain_duration = tracker.get_slot("pain_duration")
        sleep_quality = tracker.get_slot("sleep_quality")
        mood_state = tracker.get_slot("mood_state")
        activity_level = tracker.get_slot("activity_level")
        
        # Create a simple text report for the user
        report = (
            f"Pain Report Summary:\n\n"
            f"Pain intensity: {pain_intensity}/10\n"
            f"Pain location: {', '.join(pain_location)}\n"
            f"Pain quality: {', '.join(pain_quality)}\n"
            f"Pain duration: {pain_duration}\n"
            f"Sleep quality: {sleep_quality}\n"
            f"Mood state: {mood_state}\n"
            f"Activity level: {activity_level}\n\n"
            f"Would you like to add any notes to this report?"
        )
        
        dispatcher.utter_message(text=report)
        
        # If IBM Pain States API has analyzed the data, we could retrieve and share insights
        report_id = tracker.get_slot("report_id")
        if report_id and report_id != "unknown":
            try:
                headers = {
                    "Content-Type": "application/json",
                    "x-ibm-client-id": IBM_PAIN_API_KEY
                }
                
                response = requests.get(
                    f"{IBM_PAIN_API_URL}/patient-reports/{report_id}/insights",
                    headers=headers
                )
                
                if response.status_code == 200:
                    insights = response.json()
                    # Format and display insights from IBM Pain States
                    if insights.get("pain_state_prediction"):
                        dispatcher.utter_message(text=f"Based on your report, you may be experiencing: "
                                                    f"{insights['pain_state_prediction']}")
                    
                    if insights.get("recommendations"):
                        dispatcher.utter_message(text="Recommendations based on your pain profile:")
                        for rec in insights["recommendations"]:
                            dispatcher.utter_message(text=f"- {rec}")
            
            except Exception as e:
                # Silently handle errors in getting insights - don't bother the user
                pass
        
        return []


class ActionAddNotesToReport(Action):
    def name(self) -> Text:
        return "action_add_notes_to_report"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the notes from the latest user message
        latest_message = tracker.latest_message.get("text", "")
        report_id = tracker.get_slot("report_id")
        
        if report_id and report_id != "unknown":
            try:
                # Submit notes to IBM Pain States API
                headers = {
                    "Content-Type": "application/json",
                    "x-ibm-client-id": IBM_PAIN_API_KEY
                }
                
                data = {
                    "notes": latest_message
                }
                
                response = requests.patch(
                    f"{IBM_PAIN_API_URL}/patient-reports/{report_id}",
                    headers=headers,
                    json=data
                )
                
                if response.status_code == 200:
                    dispatcher.utter_message(text="Your notes have been added to the report. Thank you!")
                else:
                    dispatcher.utter_message(text="I couldn't add your notes online, but I've saved them locally.")
                    # Save locally as fallback
                    timestamp = datetime.datetime.now().isoformat()
                    os.makedirs("pain_reports/notes", exist_ok=True)
                    with open(f"pain_reports/notes/{tracker.sender_id}_{timestamp}.txt", "w") as f:
                        f.write(latest_message)
            
            except Exception as e:
                dispatcher.utter_message(text="I couldn't add your notes to the report, but I've saved them locally.")
                # Save locally as fallback
                timestamp = datetime.datetime.now().isoformat()
                os.makedirs("pain_reports/notes", exist_ok=True)
                with open(f"pain_reports/notes/{tracker.sender_id}_{timestamp}.txt", "w") as f:
                    f.write(latest_message)
        
        else:
            # No report ID, just save locally
            timestamp = datetime.datetime.now().isoformat()
            os.makedirs("pain_reports/notes", exist_ok=True)
            with open(f"pain_reports/notes/{tracker.sender_id}_{timestamp}.txt", "w") as f:
                f.write(latest_message)
            dispatcher.utter_message(text="I've saved your notes locally. Thank you!")
        
        return []