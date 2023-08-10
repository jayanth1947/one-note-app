import { LightningElement } from 'lwc';

export default class OneNote extends LightningElement {
    showModal=false;
    createNoteHandler(){
        this.showModal=true;
    }

    closeModalHandler(){
        this.showModal=false;
    }
}