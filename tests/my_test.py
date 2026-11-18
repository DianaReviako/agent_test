from datetime import datetime


def create_test_session(user_id, permissions=None):
    if permissions is None:
        permissions = ['guest']
    else:
        permissions = list(permissions)
    permissions.append('read')

    return {
        'user_id': user_id,
        'permissions': permissions,
        'created_at': datetime.now(),
    }