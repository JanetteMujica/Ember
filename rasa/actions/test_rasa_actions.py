# test_rasa_actions.py
# Simple test script to verify action registration

import importlib
import inspect
from typing import List, Type
from rasa_sdk import Action
from rasa_sdk.executor import ActionExecutor

def check_action_registration():
    """Check that all actions are properly registered and can be imported"""
    
    print("Checking action registration...")
    
    # Create action executor
    action_executor = ActionExecutor()
    
    try:
        # Register actions package
        action_executor.register_package('actions')
        print(f"✅ Successfully registered 'actions' package")
    except Exception as e:
        print(f"❌ Failed to register 'actions' package: {str(e)}")
        return
    
    # Get all actions
    all_actions = action_executor.actions
    
    if not all_actions:
        print(f"❌ No actions were registered")
        return
    
    # Print all registered actions
    print(f"\n✅ Found {len(all_actions)} registered actions:")
    for i, action_name in enumerate(all_actions, 1):
        print(f"  {i}. {action_name}")
    
    # Check the expected actions are present
    expected_actions = [
        "action_save_tracking_preferences",
        "action_save_tracking_entry",
        "action_save_medication_event",
        "action_save_experience",
        "action_add_custom_category",
        "action_show_all_categories",
        "action_get_current_categories",
        "action_update_categories",
        "action_redirect_to_visualize",
        "action_redirect_to_journal",
        "action_save_journal_entry",
        "action_select_tracking_category",
        "action_save_new_symptom",
        "action_save_other_event",
        "action_handle_additional_category",
        "action_set_tracking_frequency",
        "action_set_tracking_time",
        "action_rate_severity",
        "action_start_tracking",
        "action_reset_slots",
        "action_ask_track_now",
        "action_finalize_tracking"
    ]
    
    # Check missing actions
    missing_actions = [action for action in expected_actions if action not in all_actions]
    if missing_actions:
        print(f"\n⚠️ WARNING: {len(missing_actions)} expected actions are missing:")
        for action in missing_actions:
            print(f"  - {action}")
    else:
        print(f"\n✅ All expected actions are registered!")

if __name__ == "__main__":
    check_action_registration()