from enum import Enum


class VehicleStatus(Enum):
    UNUSED = "Unused"  # defult

    SERVICED = "Serviced"
    OVERDUE = "Overdue"

    NOTIFIED = "Notified"
    EARLY_NOTIFIED = "Early Notified"

    PENDING_APPROVAL = "Pending Approval"

    UPCOMING = "Upcoming"
    UNCHECKED = "Unchecked"
