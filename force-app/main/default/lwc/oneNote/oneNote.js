import { LightningElement, wire } from 'lwc';
import createNoteRecord from '@salesforce/apex/oneNoteController.createNoteRecord';
import getNotes from '@salesforce/apex/oneNoteController.getNotes';
import updateNoteRecord from '@salesforce/apex/oneNoteController.updateNoteRecord';
import {refreshApex} from '@salesforce/apex';
const DEFAULT_NOTE_FORM={
    Name:"",
    Description__c	:""
}
export default class OneNote extends LightningElement {

    showModal=false
    noteRecord=DEFAULT_NOTE_FORM
    noteList=[]
    selectedRecordId
    wireNoteResult
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

    get isFormInvalid(){
        return !(this.noteRecord && this.noteRecord.Name && this.noteRecord.Description__c)
    }

    get modalName(){
        return this.selectedRecordId ? "Update Note":"Add Note"

    }
    @wire(getNotes)
    noteListInfo(result){
        this.wireNoteResult=result
        const {data,error}=result
        if(data){
            console.log("data of notes",JSON.stringify(data));
            this.noteList= data.map(item=>{
                let formatedDate =new Date(item.LastModifiedDate).toDateString()
                return {...item,formatedDate}
            })
        }
        if(error){
            console.error("error in fetching",error);
            this.showToastMsg(error.message.body,'error')
        }
    }

    createNoteHandler(){
        this.showModal=true
    }

    closeModalHandler(){
        this.showModal=false
        this.noteRecord=DEFAULT_NOTE_FORM
        this.selectedRecordId=null
    }

    changeHandler(event){
        const {name,value}=event.target
        // const name=event.target.name;
        // const value=event.target.value;
        this.noteRecord={...this.noteRecord,[name]:value}
    }

    submitHandler(event){
        event.preventDefault();
        console.log("this.noteRecord", JSON.stringify( this.noteRecord))
        if(this.selectedRecordId){
            this.updateNote(this.selectedRecordId)
        }
        else{
            this.createNote()
        }
        
       
    }

    createNote(){
        createNoteRecord({title:this.noteRecord.Name, description:this.noteRecord.Description__c}).then(()=>{
            this.showModal=false;
            this.selectedRecordId=null;
            this.showToastMsg("Note Created Successfully",'success')
            this.refresh()
        }).catch(error=>{
            console.error("error",error.message.body);
            this.showToastMsg(error.message.body,'error')
        })
    }

    showToastMsg(message,variant){
        const element =this.template.querySelector('c-oneNoteNotification')
        if(element){
            element.showToast(message,variant)
        }
    }

    editNoteHandler(event){
       const {recordid}= event.target.dataset
       const noteRecord=this.noteList.find(item=>item.Id === recordid)
       this.noteRecord={
           Name:noteRecord.Name,
           Description__c:noteRecord.Description__c
       }
       this.selectedRecordId=recordid
       this.showModal=true
    }

    updateNote(noteId){
        const {Name,Description__c}=this.noteRecord
        updateNoteRecord({"noteId":noteId,"title":Name,"description":Description__c}).then(()=>{
            this.showModal=false
            this.selectedRecordId=null
            this.showToastMsg("Note Updated Successfully!",'success')
            this.refresh()
        }).catch(error=>{
            console.error("Error in updating",error);
            this.showToastMsg(error.message.body,'error')
        })
    }

    refresh(){
        return refreshApex(this.wireNoteResult)
    }
}