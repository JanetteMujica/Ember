# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionSubmitPainAssessment(Action):
    def name(self) -> Text:
        return "action_submit_pain_assessment"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        pain_level = tracker.get_slot("pain_level")
        pain_location = tracker.get_slot("pain_location")
        pain_duration = tracker.get_slot("pain_duration")
        
        # Here you would integrate with IBM Pain States API
        # For now, we'll just acknowledge the input
        
        dispatcher.utter_message(text=f"Thank you for reporting your pain. I've recorded that you're experiencing {pain_level} pain in your {pain_location} for {pain_duration}.")
        
        return []