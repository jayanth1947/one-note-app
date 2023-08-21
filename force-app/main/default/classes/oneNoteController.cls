public without sharing class oneNoteController {

    // Method to create a new note record
   @AuraEnabled
   public static Boolean createNoteRecord(String title,String description){
       try {
           if(!String.isBlank(title)){
            // Create a new note record with the provided title and description
            My_Note__c noteRec=new My_Note__c(Name=title,Description__c=description);
            insert noteRec;
            return true;
           }
           return false;
       } catch (Exception e) {
           // Handle exceptions and throw an AuraHandledException with the error message
           throw new AuraHandledException(e.getMessage());
       }
   }

   // Method to retrieve a list of note records
   @AuraEnabled(cacheable=true)
   public static List<My_Note__c> getNotes(){

       // Query and return a list of note records ordered by last modified date
       return [SELECT Id,Name,Description__c, LastModifiedDate FROM My_Note__c ORDER BY LastModifiedDate DESC];
   }

   
   // Method to update an existing note record
   @AuraEnabled
   public static Boolean updateNoteRecord(String noteId,String title, String description){
       try {
           if(!String.isBlank(noteId)){
               // Query the note record by ID
               My_Note__c note=[SELECT Id,Name,Description__c,LastModifiedDate FROM My_Note__c WHERE Id=:noteId];

               // Update the note record with the provided title and description
               note.Name=title;
               note.Description__c=description;
               update note;
               return true;
           }
           return false;
       } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
       }
   }

   // Method to delete an existing note record
   @AuraEnabled
   public static Boolean deleteNoteRecord(String noteId){
       try {
           if(!String.isBlank(noteId)){
               // Create a note record instance with the provided ID and delete it
               My_Note__c noteRec = new My_Note__c(Id=noteId);
               delete noteRec;
               return true;
           }
           
           return false;
       } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
       }
   }
}