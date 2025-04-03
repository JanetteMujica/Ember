# direct_import.py
# Directly import and test each action class

import sys
import traceback
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

# Set the BASE_URL attribute for BaseAPIAction to avoid errors
import actions.base_action
actions.base_action.BASE_URL = "http://localhost:5000"

# Import everything from actions
from actions import *

# Test that all action classes have a name() method implemented
def test_action_names():
    """Test that all action classes have a name method implemented"""
    
    print("Testing action name methods...")
    
    action_classes = [
        ActionSaveTrackingPreferences,
        ActionSaveTrackingEntry,
        ActionSaveMedicationEvent,
        ActionSaveExperience,
        ActionAddCustomCategory,
        ActionShowAllCategories, 
        ActionGetCurrentCategories,
        ActionUpdateCategories,
        ActionRedirectToVisualize,
        ActionRedirectToJournal,
        ActionSaveJournalEntry,
        ActionSelectTrackingCategory,
        ActionSaveNewSymptom,
        ActionSaveOtherEvent,
        ActionHandleAdditionalCategory,
        ActionSetTrackingFrequency,
        ActionSetTrackingTime,
        ActionRateSeverity,
        ActionStartTracking,
        ActionResetSlots,
        ActionAskTrackNow,
        ActionFinalizeTracking
    ]
    
    for i, action_class in enumerate(action_classes, 1):
        try:
            action_instance = action_class()
            action_name = action_instance.name()
            print(f"  {i}. ✅ {action_class.__name__}: {action_name}")
        except Exception as e:
            print(f"  {i}. ❌ {action_class.__name__}: Error: {str(e)}")
            print(f"     Full Traceback:")
            traceback.print_exc(file=sys.stdout)
            print("")
    
    print("\nTest complete.")

if __name__ == "__main__":
    test_action_names()