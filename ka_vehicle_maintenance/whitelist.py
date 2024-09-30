import frappe

@frappe.whitelist()
def sendemail(args):
    # send email
    frappe.sendmail(
        recipients=["ahmed.abdin@shahico.net"],
        subject="Test Notification",
        message="This is a test notification",
    )
    print(f"\n\n\n Email sent {args}") 
