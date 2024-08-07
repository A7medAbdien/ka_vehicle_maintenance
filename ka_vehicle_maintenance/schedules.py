import frappe
from frappe.utils import nowdate


def update_state():
    today = nowdate()

    docs = frappe.get_all(
        "Maintenance Visit KA",
        filters={"docstatus": 0, "state": "Upcoming", "reminding_date": today},
    )

    docs_len = len(docs)
    if docs_len == 0:
        return

    # # send email
    # frappe.sendmail(
    #     recipients=["ahmed.abdin@shahic.net"],
    #     subject="Test Notification",
    #     message="This is a test notification",
    # )

    for index, doc in enumerate(docs, start=1):
        mv = frappe.get_doc("Maintenance Visit KA", doc.name)
        mv.db_set("state", "Unchecked", commit=True)

        # Create a notification log
        n = frappe.new_doc("Notification Log")
        n.subject = (
            f"Reminder {index} of {docs_len} Maintenance Visit Reminder for {today}"
        )
        n.email_content = "This is a reminder for your maintenance visit"
        n.document_type = "Maintenance Visit KA"
        n.document_name = doc.name
        n.insert()

        # Update vehicle visit state
        vv_list = frappe.get_all(
            "Vehicle Visit KA",
            filters={"maintenance_visit": mv.name},
        )
        for vv in vv_list:
            vv_doc = frappe.get_doc("Vehicle Visit KA", vv.name)
            vv_doc.db_set("state", "Unchecked", commit=True)


# bench enable-scheduler
# bench execute ka_vehicle_maintenance.schedules.update_state
