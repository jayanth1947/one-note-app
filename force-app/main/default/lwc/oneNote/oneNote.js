import { LightningElement } from 'lwc';


const DEFAULT_NOTE_FORM={
    Name:"",
    Description__c	:""
}
export default class OneNote extends LightningElement {

    showModal=false
    noteRecord=DEFAULT_NOTE_FORM
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
    createNoteHandler(){
        this.showModal=true
    }

    closeModalHandler(){
        this.showModal=false
        this.noteRecord=DEFAULT_NOTE_FORM
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
    }
}