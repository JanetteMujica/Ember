from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

# Import base classes
from actions.base_action import BaseAction, BaseAPIAction

# Import action implementations from modular files
from actions.tracking_actions import (
    ActionSaveTrackingPreferences,
    ActionSaveTrackingEntry,
    ActionSelectTrackingCategory,
    ActionSetTrackingFrequency,
    ActionSetTrackingTime,
    ActionRateSeverity,
    ActionStartTracking,
    ActionHandleAdditionalCategory,
    ActionAddCustomCategory,
    ActionAskTrackNow,
    ActionFinalizeTracking
)

from actions.journal_actions import (
    ActionSaveJournalEntry,
    ActionSaveExperience
)

from actions.event_actions import (
    ActionSaveMedicationEvent,
    ActionSaveNewSymptom,
    ActionSaveOtherEvent
)

from actions.utility_actions import (
    ActionResetSlots,
    ActionShowAllCategories,
    ActionGetCurrentCategories,
    ActionUpdateCategories,
    ActionRedirectToVisualize,
    ActionRedirectToJournal
)

# This empty action is required to avoid the "An action must implement a name" error
# It ensures there's at least one directly importable action in this file
class EmptyAction(Action):
    def name(self) -> Text:
        return "action_empty"
        
    def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        return []
