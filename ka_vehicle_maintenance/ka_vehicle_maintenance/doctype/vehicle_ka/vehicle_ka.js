// Copyright (c) 2024, ahmed.g.abdin and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle KA", {
    refresh(frm) {
        // Function to reorder the child table items
        const reorderChildTable = () => {
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

        // Call the reorder function (can be triggered by any event or button)
        reorderChildTable();
    },
});
