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

"""Vehicle
lincense_plate
model
year
vehicle_type
state
current_km
last_visit_date
visits
insurance
end_date
ownership
vehicle_owner
"""


# Vehicle Visit Events
def on_vehicle_visit_update(doc, event):
    # update visits table in vehicle
    update_vehicle(doc)


def update_vehicle(doc):
    pass


# Maintenace Visit Events
def on_maintenance_update(doc, event):
    # update/create viehicle visit
    update_vehicle_visit(doc)


# def on_maintenance_delete(doc, event):
#     # delete vehicle visit
#     if frappe.db.exists("Vehicle Visit KA", doc.name):
#         frappe.delete_doc("Vehicle Visit KA", doc.name)


def update_vehicle_visit(doc):
    # Check if the document exists
    if frappe.db.exists("Vehicle Visit KA", doc.name):
        vv = frappe.get_doc("Vehicle Visit KA", doc.name)
        vv.parent = doc.name
        vv.vehicle = doc.vehicle
        vv.vehicle_year = doc.vehicle_year
        vv.state = doc.state
        vv.last_km = doc.last_km
        vv.new_km = doc.new_km
        vv.reminding_date = doc.reminding_date
        vv.maintenance_date = doc.maintenance_date
        vv.attachment = doc.attachment
        vv.next_reminding_date = doc.next_reminding_date
        vv.next_maintenance_date = doc.next_maintenance_date
        vv.save()

    else:
        vv = frappe.new_doc("Vehicle Visit KA")
        vv.parent = doc.name
        vv.update(
            {
                k: v
                for k, v in doc.as_dict().items()
                if k not in ["doctype", "amended_from", "__unsaved", "creation"]
            }
        )
        vv.insert()


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
