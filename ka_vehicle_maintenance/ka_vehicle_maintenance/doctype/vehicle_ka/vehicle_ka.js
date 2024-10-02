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
const OwnershipStatus = {
    LTO: "LTO",
    Rental: "Rental",
};

frappe.ui.form.on("Vehicle KA", {
    ownership_type(frm) {
        toggleLTODoc(frm)
    },
    onload(frm) {
        toggleLTODoc(frm)
        translateState(frm);
        reorderChildTable(frm);
    },
    refresh(frm) {
        // Custom buttons in groups
        // frm.add_custom_button("Test", () => {
        //     console.log("HI");
        //     someFuntion();
        // });
        reorderChildTable(frm);
    },
    before_save(frm) {
        validateLTODoc(frm)
    }
});

const toggleLTODoc = (frm) => {
    if (frm.doc.ownership_type == OwnershipStatus.LTO) {
        frm.toggle_display("lto_doc", true);
    } else {
        frm.toggle_display("lto_doc", false);
    }
}

const validateLTODoc = (frm) => {
    if (frm.doc.ownership_type == OwnershipStatus.LTO && !frm.doc.lto_doc) {
        // frm.set_value("ownership_type", OwnershipStatus.Rental)
        // frm.save()
        frappe.throw({
            title: __("Missing LTO Document"),
            message: __("Attach the LTO Document in order to save Ownership Type as LTO"),
        });
    }
}

// Function to reorder the child table items
const reorderChildTable = (frm) => {
    // Get the child table data
    let child_table_data = frm.doc.visits;

    // Example: Sort the items by maintenance date
    child_table_data.sort((a, b) =>
        b.maintenance_date.localeCompare(a.maintenance_date)
    );

    // Update the idx values
    child_table_data.forEach((item, index) => {
        item.idx = index + 1;
    });

    // Refresh the field to reflect changes
    frm.refresh_field("visits");
};

const someFuntion = () => { };

/**
 * called
 * need_visit
 * visited
 * visit_late
 */
const translateState = (frm) => {
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
            frm.set_value("called", "No");
            frm.set_value("need_visit", "No");
            frm.set_value("visited", "No");
            frm.set_value("visit_late", "No");
            break;
    }
    // frm.save();
};
