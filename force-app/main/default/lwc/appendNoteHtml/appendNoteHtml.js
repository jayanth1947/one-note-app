import { api, LightningElement } from 'lwc';

export default class AppendNoteHtml extends LightningElement {

    // Private variable to store the HTML content
    _result
    // Flag to track whether content has been loaded
    loaded


     // Getter for the 'result' property
    @api
    get result(){
        return this._result
    }


    // Setter for the 'result' property
    set result(data){

        // Update the private variable with the new data
        this._result=data

        // If content is loaded, attach the HTML
        if(this.loaded){
            this.attachHtml()
        }
    }


    // Callback after component renders
    renderedCallback(){
        // If there's data and content hasn't been loaded yet, attach the HTML
        if(this._result && !this.loaded){
            this.attachHtml()
        }
    }

    // Function to attach the HTML content to the DOM
    attachHtml(){
        // Find the HTML container element in the template
        const container =this.template.querySelector('.htmlcontainer')

        // If the container is found, set its innerHTML to the stored HTML
        if(container){
            // Set the innerHTML of the container to the stored HTML content
            container.innerHTML=this.result

            // Mark content as loaded
            this.loaded=true
        }
    }

}