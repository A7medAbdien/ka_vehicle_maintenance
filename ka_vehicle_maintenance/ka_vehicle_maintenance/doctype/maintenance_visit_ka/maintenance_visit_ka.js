// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt

frappe.ui.form.on("Maintenance Visit KA", {
    refresh(frm) {},
    state(frm) {
        switch (frm.doc.state) {
            case "Pending Approval":
            case "Unchecked":
            case "Upcoming":
                console.log("Nothing to do");
                break;

            case "Serviced":
            case "Overdue":
                const after_8_days = frappe.datetime.add_days(
                    frm.doc.maintenance_date,
                    8
                );
                createNewMV(frm, after_8_days);
                if (!frm.doc.attachments)
                    frappe.throw({
                        title: __("Missing Attachment"),
                        message: __("Attach the Document in order to submit"),
                    });

                break;

            case "Notified":
            case "Early Notified":
                frappe.prompt(
                    {
                        label: __("Reminding Date"),
                        fieldname: "date",
                        fieldtype: "Date",
                    },
                    (values) => {
                        console.log(values.date);
                        frm.set_value("next_reminding_date", values.date);
                        if (!frm.doc.next_reminding_date || !values.date)
                            frappe.throw({
                                title: __("Missing Next Reminding Date"),
                                message: __(
                                    "Please enter the next reminding date"
                                ),
                            });
                        createNewMV(frm, values.date);
                    },
                    __("Next Reminding Date")
                );

                break;

            default:
                break;
        }
    },
});

const createNewMV = (frm, reminding_date) => {
    frappe.call({
        method: "ka_vehicle_maintenance.events.create_new_maintenance_visit",
        args: {
            doc: frm.doc,
            reminding_date: reminding_date,
        },
        callback: ({ message }) => {
            console.log(message);
        },
    });
};
