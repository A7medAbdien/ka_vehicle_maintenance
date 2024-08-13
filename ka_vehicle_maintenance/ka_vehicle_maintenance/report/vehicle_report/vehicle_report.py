# Copyright (c) 2024, ahmed.g.abdin and contributors
# For license information, please see license.txt

# import frappe


import frappe


def execute(filters=None):
    columns, data = [], []

    columns = [
        {
            "fieldname": "name",
            "label": "Vehicle",
            "fieldtype": "Link",
            "options": "Vehicle KA",
        },
        {
            "fieldname": "state",
            "label": "Status",
            "fieldtype": "Data",
        },
        {
            "fieldname": "current_km",
            "label": "Current KM",
            "fieldtype": "Float",
        },
        {
            "fieldname": "last_visit_date",
            "label": "Last Visit",
            "fieldtype": "Date",
        },
    ]

    vehicles = get_vehicle(filters)
    data = [
        {
            "name": row.name,
            "state": row.state,
            "current_km": row.current_km,
            "last_visit_date": row.last_visit_date,
        }
        for row in vehicles
    ]
    return columns, data


def get_vehicle(filters):
    v = frappe.qb.DocType("Vehicle KA")

    query = frappe.qb.from_(v).select(
        v.name,
        v.state,
        v.current_km,
        v.last_visit_date,
    )
    return query.run(as_dict=True)
