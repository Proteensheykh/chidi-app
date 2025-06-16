"""
JSON utilities for serialization and deserialization.
"""
import json
from datetime import datetime
from typing import Any


class CustomJSONEncoder(json.JSONEncoder):
    """
    Custom JSON encoder that handles datetime objects.
    """
    def default(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def json_dumps(obj: Any) -> str:
    """
    Serialize an object to JSON string with custom encoder.
    
    Args:
        obj: The object to serialize
        
    Returns:
        JSON string representation
    """
    return json.dumps(obj, cls=CustomJSONEncoder)
