# Copyright (c) 2024, ahmed.g.abdin and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from frappe.utils import add_days


class MaintenanceVisitKA(Document):
    def validate(self):
        if not self.reminding_date and self.maintenance_date:
            self.reminding_date = add_days(self.maintenance_date, -3)
