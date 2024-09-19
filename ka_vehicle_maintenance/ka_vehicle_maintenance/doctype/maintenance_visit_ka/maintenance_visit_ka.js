// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt
const VehicleStatus = {
    UNUSED: "Unused",
    SERVICED: "Serviced",
    OVERDUE: "Overdue",

    NOTIFIED: "Notified",
    EARLY_NOTIFIED: "Early Notified",

    PENDING_APPROVAL: "Pending Approval",

    UPCOMING: "Upcoming",
    UNCHECKED: "Unchecked",
};

frappe.ui.form.on("Maintenance Visit KA", {
    state(frm) {
        translateState(frm);
    },
    called(frm) {
        determineState(frm);
    },
    visited(frm) {
        determineState(frm);
    },
    visit_late(frm) {
        determineState(frm);
    },
    need_visit(frm) {
        determineState(frm);
    },
    new_km(frm) {
        updateDistance(frm);
    },
    onload(frm) {
        translateState(frm);
        updateDistance(frm);
    },
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
            case VehicleStatus.UNUSED:
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

/**
 * called
 * need_visit
 * visited
 * visit_late
 */
const translateState = (frm) => {
    if (frm.doc.docstatus === 1) return;
    const state = frm.doc.state;
    switch (state) {
        case VehicleStatus.SERVICED:
            frm.set_value("called", "Yes");
            frm.set_value("need_visit", "Yes");
            frm.set_value("visited", "Yes");
            frm.set_value("visit_late", "No");
            break;
        case VehicleStatus.OVERDUE:
            frm.set_value("called", "Yes");
            frm.set_value("need_visit", "Yes");
            frm.set_value("visited", "Yes");
            frm.set_value("visit_late", "Yes");
            break;
        case VehicleStatus.NOTIFIED:
            frm.set_value("called", "Yes");
            frm.set_value("need_visit", "Yes");
            frm.set_value("visited", "No");
            frm.set_value("visit_late", "No");
            break;
        case VehicleStatus.EARLY_NOTIFIED:
            frm.set_value("called", "Yes");
            frm.set_value("need_visit", "No");
            frm.set_value("visited", "No");
            frm.set_value("visit_late", "No");
            break;
        case VehicleStatus.PENDING_APPROVAL:
            frm.set_value("called", "Yes");
            frm.set_value("need_visit", "Yes");
            frm.set_value("visited", "Yes");
            frm.set_value("visit_late", "No");
            break;
        case VehicleStatus.UNCHECKED:
        case VehicleStatus.UPCOMING:
        case VehicleStatus.UNUSED:
            frm.set_value("called", "No");
            frm.set_value("need_visit", "No");
            frm.set_value("visited", "No");
            frm.set_value("visit_late", "No");
            break;
    }
};

const determineState = (frm) => {
    if (frm.doc.docstatus === 1) return;
    const called = frm.doc.called;
    const need_visit = frm.doc.need_visit;
    const visited = frm.doc.visited;
    const visit_late = frm.doc.visit_late;

    // allow write only if yes based on order
    if (called === "No") {
        frm.set_df_property("need_visit", "read_only", 1);
        frm.set_df_property("visited", "read_only", 1);
        frm.set_df_property("visit_late", "read_only", 1);
    } else {
        frm.set_df_property("need_visit", "read_only", 0);
        frm.set_df_property("visited", "read_only", 0);
        frm.set_df_property("visit_late", "read_only", 0);
    }
    if (need_visit === "No") {
        frm.set_df_property("visited", "read_only", 1);
        frm.set_df_property("visit_late", "read_only", 1);
    } else {
        frm.set_df_property("visited", "read_only", 0);
        frm.set_df_property("visit_late", "read_only", 0);
    }
    if (visited === "No") {
        frm.set_df_property("visit_late", "read_only", 1);
    } else {
        frm.set_df_property("visit_late", "read_only", 0);
    }

    if (
        called === "Yes" &&
        need_visit === "Yes" &&
        visited === "Yes" &&
        visit_late === "No"
    ) {
        frm.set_value("state", VehicleStatus.SERVICED);
    } else if (
        called === "Yes" &&
        need_visit === "Yes" &&
        visited === "Yes" &&
        visit_late === "Yes"
    ) {
        frm.set_value("state", VehicleStatus.OVERDUE);
    } else if (
        called === "Yes" &&
        need_visit === "Yes" &&
        visited === "No" &&
        visit_late === "No"
    ) {
        frm.set_value("state", VehicleStatus.NOTIFIED);
    } else if (
        called === "Yes" &&
        need_visit === "No" &&
        visited === "No" &&
        visit_late === "No"
    ) {
        frm.set_value("state", VehicleStatus.EARLY_NOTIFIED);
    } else if (
        called === "Yes" &&
        need_visit === "Yes" &&
        visited === "Yes" &&
        visit_late === "No"
    ) {
        frm.set_value("state", VehicleStatus.PENDING_APPROVAL);
    } else if (
        called === "No" &&
        need_visit === "No" &&
        visited === "No" &&
        visit_late === "No"
    ) {
        frm.set_value("state", VehicleStatus.UNCHECKED); // Or UNCHECKED, depending on the logic
    }
};

const updateDistance = (frm) => {
    if (frm.doc.docstatus === 1) return;
    const last_km = frm.doc.last_km;
    const new_km = frm.doc.new_km;
    if (last_km && new_km) {
        const distance = frm.doc.new_km - frm.doc.last_km;
        frm.set_value("distance", distance);
    } else frm.set_value("distance", 0);
};
