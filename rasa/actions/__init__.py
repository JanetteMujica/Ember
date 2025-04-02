# actions/__init__.py
# This file is the entry point for all actions
# It imports and exposes all action classes from the other files

from actions.base_action import BaseAPIAction, BaseAction
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

# Import the router action
from actions.routing_action import ActionInformRouter

# Import test action for debugging
from actions.test_action import ActionTest

# List all classes that should be imported by Rasa
__all__ = [
    'ActionTest',
    'ActionSaveTrackingPreferences',
    'ActionSaveTrackingEntry',
    'ActionSaveMedicationEvent',
    'ActionSaveExperience',
    'ActionAddCustomCategory',
    'ActionShowAllCategories',
    'ActionGetCurrentCategories',
    'ActionUpdateCategories',
    'ActionRedirectToVisualize',
    'ActionRedirectToJournal',
    'ActionSaveJournalEntry',
    'ActionSelectTrackingCategory',
    'ActionSaveNewSymptom',
    'ActionSaveOtherEvent',
    'ActionHandleAdditionalCategory',
    'ActionSetTrackingFrequency',
    'ActionSetTrackingTime',
    'ActionRateSeverity',
    'ActionStartTracking',
    'ActionResetSlots',
    'ActionAskTrackNow',
    'ActionFinalizeTracking',
    'ActionInformRouter'
]