// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt

frappe.ui.form.on("Maintenance Visit KA", {
    refresh(frm) {},
    after_save(frm) {
        if (frm.doc.docstatus == 0 && !frm.doc.checked_at) {
            switch (frm.doc.state) {
                case "Serviced":
                case "Overdue":
                case "Notified":
                case "Early Notified":
                    frm.doc.checked_at = frm.doc.modified;
                    break;
            }
        }
    },
    before_submit(frm) {
        switch (frm.doc.state) {
            case "Pending Approval":
            case "Unchecked":
            case "Upcoming":
                // Prevent the default submit action
                frappe.validated = false;
                frappe.throw({
                    title: __("Unvalid State"),
                    message: __("You can not submit document in this State"),
                });
                break;

            case "Serviced":
            case "Overdue":
                if (!frm.doc.attachments) {
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

            case "Notified":
            case "Early Notified":
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
                        frm.save_or_update();
                    },
                    __("Next Reminding Date")
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
