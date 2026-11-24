from collections.abc import Iterable
from datetime import datetime
from typing import Any

DEFAULT_PERMISSION = "guest"
READ_PERMISSION = "read"


def create_test_session(
    user_id: str | int, permissions: Iterable[str] | None = None
) -> dict[str, Any]:
    permissions = [DEFAULT_PERMISSION] if permissions is None else list(permissions)
    if READ_PERMISSION not in permissions:
        permissions.append(READ_PERMISSION)

    return {
        "user_id": user_id,
        "permissions": permissions,
        "created_at": datetime.now(),
    }
