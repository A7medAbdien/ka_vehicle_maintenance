from enum import Enum

class VehicleOwnershipType(Enum):
    RENTED = "Rented"
    LTO = "LTO"

class VehicleStatus(Enum):
    UNUSED = "Unused"  # defult

    SERVICED = "Serviced"
    OVERDUE = "Overdue"

    IN_GARAGE= "In Garage"
    NOTIFIED = "Notified"
    EARLY_NOTIFIED = "Early Notified"

    PENDING_APPROVAL = "Pending Approval"

    UPCOMING = "Upcoming"
    UNCHECKED = "Unchecked"
