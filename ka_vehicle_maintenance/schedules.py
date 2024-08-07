import frappe
from frappe.utils import nowdate


def update_state():
    today = nowdate()

    docs = frappe.get_all(
        "Maintenance Visit KA",
        filters={"docstatus": 0, "state": "Upcoming", "reminding_date": today},
    )

    # Update the state of each document
    for doc in docs:
        mv = frappe.get_doc("Maintenance Visit KA", doc.name)
        mv.db_set("state", "Unchecked", commit=True)

        vv_list = frappe.get_all(
            "Vehicle Visit KA",
            filters={"maintenance_visit": mv.name},
        )
        for vv in vv_list:
            vv_doc = frappe.get_doc("Vehicle Visit KA", vv.name)
            vv_doc.db_set("state", "Unchecked", commit=True)
