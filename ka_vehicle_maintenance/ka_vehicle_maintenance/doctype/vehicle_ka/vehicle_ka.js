// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle KA", {
    refresh(frm) {
        // Custom buttons in groups
        frm.add_custom_button("Test", () => {
            console.log("HI");
            someFuntion();
        });
        reorderChildTable(frm);
    },
});

// Function to reorder the child table items
const reorderChildTable = (frm) => {
    // Get the child table data
    let child_table_data = frm.doc.visits;

    // Example: Sort the items alphabetically by a field called 'item_name'
    child_table_data.sort((a, b) =>
        a.maintenance_date.localeCompare(b.item_name)
    );

    // Update the idx values
    child_table_data.forEach((item, index) => {
        item.idx = index + 1;
    });

    // Refresh the field to reflect changes
    frm.refresh_field("visits");
};

const someFuntion = () => {
    frappe.call({
        method: "ka_vehicle_maintenance.events.send_notification",
        // callback: function (response) {
        //     if (response.message) {
        //         frappe.msgprint(__("Notification Sent Successfully"));
        //     }
        // },
    });
};
