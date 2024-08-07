import frappe
from frappe.utils import nowdate, add_days
from frappe.query_builder import DocType


def update_state_and_send_notifications():
    today = nowdate()

    # Define your DocType for Query Builder
    MaintenanceVisitKA = DocType("Maintenance Visit KA")

    # Fetch all documents that are not submitted and have the state "Upcoming" and reminding_date < today
    docs = (
        frappe.qb.from_(MaintenanceVisitKA)
        .select(MaintenanceVisitKA.name)
        .where(
            (MaintenanceVisitKA.docstatus == 0)
            & (MaintenanceVisitKA.state == "Upcoming")
            & (MaintenanceVisitKA.reminding_date <= today)
        )
    ).run(as_dict=True)

    # Update the state of each document and send notification
    docs_len = len(docs)
    for index, doc in enumerate(docs, start=1):
        # Update the state
        frappe.db.set_value("Maintenance Visit KA", doc.name, "state", "Unchecked")

        # Create a new notification log
        n = frappe.new_doc("Notification Log")
        n.subject = f"Reminder {index} of {docs_len} Maintenance Visit Reminder"
        n.email_content = "This is a reminder for your maintenance visit"
        n.document_type = "Maintenance Visit KA"
        n.document_name = doc.name
        n.insert()

    frappe.db.commit()


def update_state():
    update_state_and_send_notifications()
