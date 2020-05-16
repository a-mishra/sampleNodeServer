import { 
    addNewContact, 
    getContacts, 
    getContactWithID, 
    getContactWithTagID,
    updateContact,
    deleteContact 
} from '../controllers/contactController';

const contactRoutes = (app) => {
    app.route('/contact')
    .get((req, res, next) => {
        // middleware
        console.log(`Request from: ${req.originalUrl}`)
        console.log(`Request type: ${req.method}`)
        next();
    }, getContacts)
    
    // POST endpoint
    .post(addNewContact);

    app.route('/contact/:contactId')
    // get specific contact
    .get(getContactWithID)
    .delete(deleteContact)
    

    app.route('/contactsForTag/:tagId')
    .get((req, res, next) => {
        // middleware
        console.log(`Request from: ${req.originalUrl}`)
        console.log(`Request type: ${req.method}`)
        next();
    }, getContactWithTagID)

    // put request
    .put(updateContact)

    // delete request
    .delete(deleteContact);
}

export default contactRoutes;
