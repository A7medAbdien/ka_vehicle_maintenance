import frappe
from frappe.utils import add_to_date
from ka_vehicle_maintenance.utils.AttrDict import AttrDict
import json


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
maintenance_visit       [Maintenance Visit]
vehicle                 [Vehicle]
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


# Maintenance Visit Events
def on_maintenance_delete(doc, event):
    doc.visits = []
    vv_list = frappe.get_all(
        "Vehicle Visit KA",
        filters={"maintenance_visit": doc.name},
        fields=["name", "parenttype"],
    )
    for vv in vv_list:
        frappe.delete_doc("Vehicle Visit KA", vv.name)


def on_maintenance_update(doc, event):
    # update/create viehicle visit
    vv_from_maintenance = update_vehicle_visit_for_maintenance(doc)
    doc.visits = [vv_from_maintenance]

    # update vehicle, fill visits table, state, current_km, last_visit_date
    update_vehicle(doc)


def update_vehicle(doc):
    # 0. get vehicle
    vehicle = frappe.get_doc("Vehicle KA", doc.vehicle)
    if vehicle is None:
        frappe.throw("Vehicle not found")
        return

    # 1. update/create vehicle visit for vehicle
    update_vehicle_visit_for_vehicle(doc)

    # 2. get latest vehicle visit state and update vehicle field (state)
    latest_visit = get_latest_visit(vehicle.name)
    if latest_visit:
        frappe.db.set_value("Vehicle KA", vehicle.name, "state", latest_visit.state)

    # 3. get latest vehicle visit with status "serviced"
    # and update filed (current_km and last_visit_date)
    latest_serviced_visit = get_latest_serviced_visit(vehicle.name)
    if latest_serviced_visit:
        frappe.db.set_value(
            "Vehicle KA",
            vehicle.name,
            "current_km",
            latest_serviced_visit.new_km,
        )
        frappe.db.set_value(
            "Vehicle KA",
            vehicle.name,
            "last_visit_date",
            latest_serviced_visit.maintenance_date,
        )


def update_vehicle_visit_for_vehicle(doc):
    vv_list = frappe.get_all(
        "Vehicle Visit KA",
        filters={
            "vehicle": doc.vehicle,
            "maintenance_visit": doc.name,
            "parenttype": "Vehicle KA",
        },
        order_by="maintenance_date",
        fields=["*"],
    )
    if len(vv_list) > 1:
        frappe.throw(
            "Multiple vehicle visits found for the same vehicle and maintenance visit."
        )
        return None
    elif len(vv_list) == 0:
        vv = frappe.new_doc("Vehicle Visit KA")
    else:
        vv = vv_list[0]
        vv = frappe.get_doc("Vehicle Visit KA", vv.name)
    vv.parent = doc.vehicle
    vv.parentfield = "visits"
    vv.parenttype = "Vehicle KA"
    vv.vehicle = doc.vehicle
    vv.maintenance_visit = doc.name
    vv.vehicle_year = doc.vehicle_year
    vv.state = doc.state
    vv.last_km = doc.last_km
    vv.new_km = doc.new_km
    vv.reminding_date = doc.reminding_date
    vv.maintenance_date = doc.maintenance_date
    vv.attachment = doc.attachment
    vv.next_reminding_date = doc.next_reminding_date
    vv.next_maintenance_date = doc.next_maintenance_date
    vv.checked_at = doc.checked_at
    vv.submitted_at = doc.submitted_at
    vv.save()


def get_latest_visit(vehicle):
    latest_visit = frappe.get_all(
        "Vehicle Visit KA",
        filters={"vehicle": vehicle},
        order_by="maintenance_date desc",
        fields=["state"],
        limit=1,
    )
    if len(latest_visit) > 0:
        return latest_visit[0]
    return None


def get_latest_serviced_visit(vehicle):
    latest_serviced_visit = frappe.get_all(
        "Vehicle Visit KA",
        filters={"vehicle": vehicle, "state": "Serviced"},
        order_by="maintenance_date desc",
        fields=["new_km", "maintenance_date"],
        limit=1,
    )
    if len(latest_serviced_visit) > 0:
        return latest_serviced_visit[0]
    return None


def update_vehicle_visit_for_maintenance(doc):
    # Check if the document exists
    vv_list = frappe.get_all(
        "Vehicle Visit KA",
        filters={"parent": doc.name, "vehicle": doc.vehicle},
        fields=["name"],
    )
    if len(vv_list) > 1:
        frappe.throw(
            "Multiple vehicle visits found for the same vehicle and maintenance visit."
        )
        return None
    elif len(vv_list) == 0:
        vv = frappe.new_doc("Vehicle Visit KA")
    else:
        vv = vv_list[0]
        vv = frappe.get_doc("Vehicle Visit KA", vv.name)

    vv.vehicle = doc.vehicle
    vv.maintenance_visit = doc.name
    vv.vehicle_year = doc.vehicle_year
    vv.state = doc.state
    vv.last_km = doc.last_km
    vv.new_km = doc.new_km
    vv.reminding_date = doc.reminding_date
    vv.maintenance_date = doc.maintenance_date
    vv.attachment = doc.attachment
    vv.next_reminding_date = doc.next_reminding_date
    vv.next_maintenance_date = doc.next_maintenance_date
    vv.checked_at = doc.checked_at
    vv.submitted_at = doc.submitted_at
    return vv


# State Change Events
@frappe.whitelist()
def create_new_maintenance_visit(doc, reminding_date=None):
    if isinstance(doc, str):
        doc = AttrDict(json.loads(doc))
    elif isinstance(doc, dict):
        doc = AttrDict(doc)

    mv = frappe.new_doc("Maintenance Visit KA")
    mv.vehicle = doc.vehicle
    mv.vehicle_year = doc.vehicle_year
    mv.state = "Upcoming"
    mv.last_km = doc.new_km
    mv.reminding_date = reminding_date
    mv.maintenance_date = add_to_date(reminding_date, days=3)
    mv.save()
    # show success message
    frappe.msgprint("New Maintenance Visit created successfully.")
    return mv
