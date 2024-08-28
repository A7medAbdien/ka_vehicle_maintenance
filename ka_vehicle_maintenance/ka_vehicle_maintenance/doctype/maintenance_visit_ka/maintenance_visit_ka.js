// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt
const VehicleStatus = {
    SERVICED: "Serviced",
    OVERDUE: "Overdue",

    NOTIFIED: "Notified",
    EARLY_NOTIFIED: "Early Notified",

    PENDING_APPROVAL: "Pending Approval",

    UPCOMING: "Upcoming",
    UNCHECKED: "Unchecked",
};

frappe.ui.form.on("Maintenance Visit KA", {
    before_save(frm) {
        // if (!frm.doc.maintenance_date && frm.doc.reminding_date) {
        //     var date = frappe.datetime.add_days(frm.doc.reminding_date, 3);
        //     frm.set_value("maintenance_date", date);
        // }
        if (!frm.doc.reminding_date && frm.doc.maintenance_date) {
            var date = frappe.datetime.add_days(frm.doc.maintenance_date, -3);
            frm.set_value("reminding_date", date);
        }
    },
    after_save(frm) {
        if (frm.doc.docstatus == 0 && !frm.doc.checked_at) {
            switch (frm.doc.state) {
                case VehicleStatus.SERVICED:
                case VehicleStatus.OVERDUE:
                case VehicleStatus.NOTIFIED:
                case VehicleStatus.EARLY_NOTIFIED:
                    frm.doc.checked_at = frm.doc.modified;
                    break;
            }
        }
    },
    before_submit(frm) {
        switch (frm.doc.state) {
            case VehicleStatus.PENDING_APPROVAL:
            case VehicleStatus.UNCHECKED:
            case VehicleStatus.UPCOMING:
                // Prevent the default submit action
                frappe.validated = false;
                frappe.throw({
                    title: __("Unvalid State"),
                    message: __("You can not submit document in this State"),
                });
                break;

            case VehicleStatus.SERVICED:
            case VehicleStatus.OVERDUE:
                if (!frm.doc.attachment) {
                    // Prevent the default submit action
                    frappe.validated = false;
                    frappe.throw({
                        title: __("Missing Attachment"),
                        message: __("Attach the Document in order to submit"),
                    });
                }
                const after_8_days = frappe.datetime.add_days(
                    frm.doc.maintenance_date,
                    8
                );
                createNewMV(frm, after_8_days);

                break;

            case VehicleStatus.NOTIFIED:
            case VehicleStatus.EARLY_NOTIFIED:
                // Prevent the default submit action
                frappe.validated = false;
                frappe.prompt(
                    {
                        label: __("Reminding Date"),
                        fieldname: "date",
                        fieldtype: "Date",
                    },
                    (values) => {
                        if (!values.date)
                            frappe.throw({
                                title: __("Missing Next Reminding Date"),
                                message: __(
                                    "Please enter the next reminding date"
                                ),
                            });
                        frm.set_value("next_reminding_date", values.date);
                        createNewMV(frm, values.date);
                        if (!frm.doc.submitted_at)
                            frm.doc.submitted_at = frm.doc.modified;
                        // save the doc
                        // frm.save_or_update();
                        frm.save("Submit");
                    },
                    __("Next Reminding Date"),
                    __("Create")
                );
                break;

            default:
                break;
        }
        if (!frm.doc.submitted_at) frm.doc.submitted_at = frm.doc.modified;
    },
});

const createNewMV = (frm, reminding_date) => {
    frappe.call({
        method: "ka_vehicle_maintenance.events.create_new_maintenance_visit",
        args: {
            doc: frm.doc,
            reminding_date: reminding_date,
        },
        // callback: ({ message }) => {
        //     console.log(message);
        // },
    });
};
