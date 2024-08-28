# Copyright (c) 2024, ahmed.g.abdin and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from frappe.utils import add_days


class MaintenanceVisitKA(Document):
    def validate(doc, method):
        if not doc.reminding_date and doc.maintenance_date:
            doc.reminding_date = add_days(doc.maintenance_date, -3)
