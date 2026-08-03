# Goal
  To create a mecanism for hiding/showing certain invoices from general users. Users with Admin roles has the authority to hide/show specefic invoices from users with other roles.

----

# Functionality
   In the InvoiceMasterDTO there is a column name tbim_delinfo.
   tbim_delinfo="D" Means this invoice will not be shown to General users.
   tbim_delinfo="A" Means this invoice will shown to General users.
   
# Front End

## 1. For the Admin users,In the action column of the InvoiceMasterDTO datatable there will be another button named show/hide. 
   2. onclick of this button will call the endpoint: /api/InvoiceMaster/HideShowToUsers?invoiceid=&showhideflag=
   3. showhideflag="D" for Hide and showhideflag="A" for show.
   4. InvoceId= Id of the selected InvoiceMaster.
   5. The show/hide button text will be changed on the basis of the value tbim_delinfo.
      if tbim_delinfo="D" button text will be show.
      if tbim_delinfo="A" button text will be hide.
   6. Provide proper color and icon in the show/hide button, so that Admin can usually understand visually about the status of an invoice.

## Precaution
   Please check whether you are saving user roles during log in. If not, check whether you are getting the user role from API.
   If you are not getting the role, get back to me. 
   And if you are saving the during login, please let me know the page and row number where it triggers and after that, proceed with implmentation.
   
   
   
   
   










