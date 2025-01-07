// express is used to create the server
import express from "express";
// body-parser is middleware for Node.js, commonly used
// with Express.js, to parse incoming request bodies before
// handlers process them. Makes request data available from
// req.body.
import bodyParser from 'body-parser';
// imports needed to resolve ES6 file and directory
// references
import path from "path";
import { fileURLToPath } from "url";
// import to include method-override middleware, to use
// HTTP methods like DELETE
import methodOverride from 'method-override';
//import needed to establish and access the database
import { setupDatabase, getDbConnection } from './database.js';

// Set up server and port
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url); // get resolved path to the file
const __dirname = path.dirname(__filename); // get name of the current directory

// Middleware is utility code that can access the request object and the response object
//
// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve files
app.use(express.static('public'));
app.use(express.static(__dirname + "/public")); // make the public folder the default

// Middleware to
// ...parse incoming requests with JSON payloads, based on body-parser. Makes parsed data available in req.body
app.use(express.json());
// ... parse incoming requests with URL-encoded payloads (like form submit), also based on body-parser.
// extended: true option lets objects and arrays to be encoded into the URL-encoded format so they can be passed.
app.use(express.urlencoded({ extended: true }));
// ... allows use of HTTP verbs PUT, DELETE. Looks for a _method query parameter in the request, overrides HTTP
// method so routing parameters (like meetingID) get to route handler.
app.use(methodOverride('_method'));

// Set up the database
setupDatabase().catch(console.error);

// Set the view engine with app.set,
// Express loads the module internally ans stores it in app reference
app.set("view engine", "ejs");

app.get("/admin", async (req, res) => {
    try {
        const db = await getDbConnection();
        const rows = await db.all('SELECT * FROM meetings');
        res.render("pages/admin", { data: rows, title: "Administer Meetings", notification: true, message: "--------" });
    }
    catch (err) {
        console.error(err);
        res.status(404).send('An error occurred while getting the data to manage');
    }
});


// Set the landing page route
// Send the index.ejs file in the pages folder, to client
// File will have an extension of .ejs, Embedded JavaScript
let dataToPass = {
    topic: "CIT Monthly Meeting",
    dateTime: "September 19th 2024, 2pm-3pm",
    location: "Knoy Hall West Lafayette"
};

app.get('/', async (req, res) => {
    try {
        const db = await getDbConnection();
        const meetings = await db.all('SELECT * FROM meetings');
        res.render('pages/index', { data: meetings, title: "Scheduled Meetings" });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching meetings');
    }
});

app.get('/about', (req, res) => {
    res.render('pages/about', { title: "About Us"});
});

app.get("/contact", (req, res) => {
    res.render("pages/contact", {title: "Contact Us"});
});

// Route to handle form submission
app.post('/add_meeting', async (req, res) => {
    const { topic, mandatory, dateTime, location, parking } = req.body;
    let is_mandatory = req.body.mandatory ? 1 : 0;
    console.log(`IN ADD MTG - topic ${topic}, mandatory ${is_mandatory}, dateTime ${dateTime}, location ${location}, parking
    ${parking}`);
    try {
        const db = await getDbConnection();
        await db.run('INSERT INTO meetings (topic, mandatory, dateTime, location, parking) V ALUES (?, ?, ?, ?, ?)', [topic, is_mandatory, dateTime, location, parking]);
        // redirect to home route
        res.redirect('/'); // Redirect back to home route
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while submitting the form');
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const db = await getDbConnection();
        await db.run('DELETE FROM meetings WHERE id = ?', req.params.id);
        res.redirect('/'); // Redirect back to home route
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting item');
    }
});

// Edit route
app.get('/edit/:id', async (req, res) => {
    const db = await getDbConnection();
    const sql = `SELECT * FROM meetings WHERE id = ?`;
    const row = await db.get(sql, req.params.id);
    res.render('pages/edit', { data: row, title: "Change Meeting", notification: true, message: "Meeting being modified" });
});
app.post('/edit/:id', async (req, res) => {
    const db = await getDbConnection();
    let { topic, mandatory, datetime, location, parking } = req.body;
    let is_mandatory = mandatory == undefined ? 0 : 1;
    const sql = `UPDATE meetings SET topic = ?, mandatory = ?, dateTime = ?, location = ?, parking = ? WHERE id = ?`;
    await db.run(sql, [topic, is_mandatory, datetime, location, parking, req.params.id]);
    res.redirect('/'); // Redirect back to home route
});
// Listen for requests
app.listen(port, () => {
    console.log(`App listening at port ${port}`)
});