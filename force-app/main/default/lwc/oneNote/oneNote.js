import { LightningElement, wire } from 'lwc';
import createNoteRecord from '@salesforce/apex/oneNoteController.createNoteRecord';
import getNotes from '@salesforce/apex/oneNoteController.getNotes';
import updateNoteRecord from '@salesforce/apex/oneNoteController.updateNoteRecord';
import {refreshApex} from '@salesforce/apex';
import LightningConfirm from 'lightning/confirm'
import deleteNoteRecord from '@salesforce/apex/oneNoteController.deleteNoteRecord';
const DEFAULT_NOTE_FORM={
    Name:"",
    Description__c	:""
}
export default class OneNote extends LightningElement {

    // Component properties
    showModal=false
    noteRecord=DEFAULT_NOTE_FORM
    noteList=[]
    selectedRecordId
    wireNoteResult

    // Array of rich text editor formats
    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'link',
        'clean',
        'table',
        'header',
        'color',
    ];

    // Determines if the note creation/edit form is valid
    get isFormInvalid(){
        return !(this.noteRecord && this.noteRecord.Name && this.noteRecord.Description__c)
    }

    // Returns the modal title based on whether it's for adding or updating a note
    get modalName(){
        return this.selectedRecordId ? "Update Note":"Add Note"

    }

    // Wire function to retrieve notes from the server
    @wire(getNotes)
    noteListInfo(result){
        // Store the wire result for potential refreshing
        this.wireNoteResult=result

        // Destructure the 'result' object into 'data' and 'error'
        const {data,error}=result

        // If data is available (no errors), process the notes
        if(data){
            // Log the fetched data as a stringified JSON
            console.log("data of notes",JSON.stringify(data));

            // Process the data to format dates and update 'noteList'
            this.noteList= data.map(item=>{

                // Convert the LastModifiedDate to a formatted date string
                let formatedDate =new Date(item.LastModifiedDate).toDateString()

                // Create a new object with the existing properties and the formatted date
                return {...item,formatedDate}
            })
        }

        // If there's an error, handle it
        if(error){
            // If there's an error, handle it
            console.error("error in fetching",error);
            this.showToastMsg(error.message.body,'error')
        }
    }

    // Event handler for adding a new note
    createNoteHandler(){
        this.showModal=true
    }

    // Event handler for closing the modal
    closeModalHandler(){
        this.showModal=false
        this.noteRecord=DEFAULT_NOTE_FORM
        this.selectedRecordId=null
    }

    // Event handler for input changes
    changeHandler(event){
        // Extract the 'name' and 'value' from the event target (input element)
        const {name,value}=event.target
        // const name=event.target.name;
        // const value=event.target.value;

        // Update the 'noteRecord' object with the new value for the specified property
        this.noteRecord={...this.noteRecord,[name]:value}
    }

    // Event handler for submitting the note form
    submitHandler(event){
        // Prevent the default form submission behavior
        event.preventDefault();
        // Log the current state of the 'noteRecord' object as a stringified JSON
        console.log("this.noteRecord", JSON.stringify( this.noteRecord))

        // Check if a record is being updated or a new one is being created
        if(this.selectedRecordId){
            // If a record is being updated, call the 'updateNote' function
            this.updateNote(this.selectedRecordId)
        }
        else{
            // If no record is being updated (new record creation), call the 'createNote' function
            this.createNote()
        }  
    }

    // Creates a new note record
    createNote(){
        // Call the 'createNoteRecord' Apex method to create a new note
        createNoteRecord({title:this.noteRecord.Name, description:this.noteRecord.Description__c})
        .then(()=>{
            // If the note creation is successful:
            // Close the modal after successful creation
            this.showModal=false;

            // Reset the selected record ID to null
            this.selectedRecordId=null;

            // Display a success toast message
            this.showToastMsg("Note Created Successfully",'success')

            // Refresh the displayed notes by calling the 'refresh' function
            this.refresh()
        }).catch(error=>{
             // If an error occurs during note creation:
            // Log the error message to the console
            console.error("error",error.message.body);

            // Display an error toast message
            this.showToastMsg(error.message.body,'error')
        })
    }

    // Displays a toast message using a custom notification component
    showToastMsg(message,variant){
         // Find the 'c-oneNoteNotification' component in the template
        const element =this.template.querySelector('c-oneNoteNotification')

         // If the component is found, call its 'showToast' method
        if(element){
            element.showToast(message,variant)
        }
    }

    // Event handler for editing a note
    editNoteHandler(event){
        // Extract the 'recordid' from the 'data' attribute of the event target
       const {recordid}= event.target.dataset

       // Find the note record in the 'noteList' based on the extracted 'recordid'
       const noteRecord=this.noteList.find(item=>item.Id === recordid)

       // Update 'noteRecord' and 'selectedRecordId' to enable editing
       this.noteRecord={
           Name:noteRecord.Name,
           Description__c:noteRecord.Description__c
       }
       this.selectedRecordId=recordid

       // Open the modal for editing the note
       this.showModal=true
    }

    // Updates an existing note record
    updateNote(noteId){
        // Destructure properties from the 'noteRecord'
        const {Name,Description__c}=this.noteRecord

        // Call the 'updateNoteRecord' Apex method to update the note
        updateNoteRecord({"noteId":noteId,"title":Name,"description":Description__c})
        .then(()=>{
            // If the note update is successful:
            
            // Close the modal after successful update
            this.showModal=false

            // Reset the selected record ID to null
            this.selectedRecordId=null

            // Display a success toast message
            this.showToastMsg("Note Updated Successfully!",'success')

            // Refresh the displayed notes by calling the 'refresh' function
            this.refresh()
        }).catch(error=>{
            // If an error occurs during note update:
            
            // Log the error message to the console
            console.error("Error in updating",error);

            // Display an error toast message
            this.showToastMsg(error.message.body,'error')
        })
    }

    // Refreshes the data using Apex refreshApex function
    refresh(){
        // Refresh the data by calling 'refreshApex' with the wire result object
        return refreshApex(this.wireNoteResult)
    }

    // Event handler for initiating note deletion
    deleteNoteHandler(event){
        // Extract the 'recordid' from the 'data' attribute of the event target (delete icon)
        this.selectedRecordId=event.target.dataset.recordid

        // Call the 'handleConfirm' function to initiate the delete confirmation process
        this.handleConfirm()
    }

    // Handles the confirmation modal for note deletion
    async handleConfirm(){
        // Display a confirmation dialog using 'LightningConfirm.open'
        const result= await LightningConfirm.open({
            message :"Are you sure you want to delete this note ?",
            variant:'headerless',
            label:'Delete Confirmation'
        })

        // Process the result of the confirmation dialog
        if(result){
            // If the user confirms the deletion, call the 'deleteHandler' function
            this.deleteHandler()
        }
        else{
            // If the user cancels the deletion, reset the selected record ID
            this.selectedRecordId=null
        }
    }

    // Deletes the selected note record
    deleteHandler(){
        // Call the 'deleteNoteRecord' Apex method to delete the selected note
        deleteNoteRecord({noteId:this.selectedRecordId})
        .then(()=>{
            // If the note deletion is successful:
            
            // Close the modal after successful deletion
            this.showModal=false

            // Reset the selected record ID to null
            this.selectedRecordId=null

             // Display a success toast message
            this.showToastMsg("Note Deleted Successfully",'success')

            // Refresh the displayed notes by calling the 'refresh' function
            this.refresh()

        }).catch(error=>{
             // If an error occurs during note deletion:  
            // Log the error message to the console
            console.error("Error in Deletion",error);

            // Display an error toast message
            this.showToastMsg(error.message.body,'error')
        })
    }
}