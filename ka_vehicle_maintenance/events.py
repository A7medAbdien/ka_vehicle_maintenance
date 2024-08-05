import frappe

"""Maintenance Visit
Vehicle
visit_year
state
last_km
new_km
reminding_date
maintaning_date
attachment
next_reminding_date
next_maintaning_date
"""

"""Vehicle Visit
parent                  [Maintenance Visit]
Vehicle                 [Vehicle]
visit_year
state
last_km
new_km
reminding_date
maintaning_date
attachment
next_reminding_date
next_maintaning_date
"""


def exclude_keys(doc, keys):
    return {k: v for k, v in doc.items() if k not in keys}


def on_maintenance_update(doc, event):
    # update/create viehicle visit
    update_vehicle_visit(doc)


def update_vehicle_visit(doc):

    print("\n\n\n here")
    print("\n\n\n")
    # Check if the document exists
    # if frappe.db.exists("Vehicle Visit KA", doc.name):
    #     vv = frappe.get_doc("Vehicle Visit KA", doc.name)
    #     vv.update(
    #         {
    #             k: v
    #             for k, v in doc.as_dict().items()
    #             if k not in ["doctype", "amended_from"]
    #         }
    #     )
    #     # vv.save()
    #     print("\n\n\n save")
    #     print(vv.as_dict())
    # else:
    #     vv = frappe.new_doc("Vehicle Visit KA")
    #     vv.parent = doc.name
    #     vv.update(
    #         {
    #             k: v
    #             for k, v in doc.as_dict().items()
    #             if k not in ["doctype", "amended_from"]
    #         }
    #     )
    #     vv.insert()
    #     print("\n\n\n insert")
    #     print(vv.as_dict())


def on_state_filed_change(doc):

    print("\n\n\n")
    print(doc)

    """
    Upcoming
    Serviced
    Pending Approval
    Notified
    Overdue
    Unchecked
    Early Notified
    """
