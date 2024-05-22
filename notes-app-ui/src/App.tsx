//put ui components here without worrying about API calls or database
//import our style sheet from App.css
//import useState for state management
import {useState, useEffect} from 'react';
import "./App.css"

//create our Note type
type Note = {
  id: number;
  title: string;
  content: string;

}

//help position our form and css grid we`ll use for the notes
const App = () => {
 
  const [notes, setNotes] = useState<Note[] >([]);

  //whenever we are working with forms, we need to add state value for each of our form inputs
  //means React can control those inputs, and makes it easy to get their values
  //since we have two inputs, we need two state variables
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // this will be called when the user clicks on a note
  const [selectedNote, setSelectedNote] =
     useState<Note | null>(null);

  //connect backend to frontend
  useEffect(() => {
    const fetchNotes = async () => {

      //prevent app from crashing when api call fails
      try {

      // Use the built-in fetch function to make a GET request to the API endpoint
      const response =
        await fetch("http://localhost:5000/api/notes")

      // Parse the JSON response body to convert it into a JavaScript array of Note objects
      // The response.json() method reads the response stream to completion and parses it as JSON
      // Assuming the API returns an array of notes, we type the resulting data as an array of Note objects
        const notes: Note[] = await response.json()

        // Update the state with the fetched notes
        setNotes(notes)
       
      } catch (e){
        console.log(e) // Log any errors that occur during the fetch process to the console
      }
    };

    //call our fetchNotes function
    fetchNotes();

  // The empty array ensures this effect runs only once, after the initial render
  }, []); 


  //this function will handle event when the user clicks on a note
  //it will update our form when the user clicks on a note
  const handleNoteClick = (note:Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  //we need a function that will be called when the form is submitted
  const handleAddNote = async (
    event: React.FormEvent // Event object representing the form submission
  ) => {
    event.preventDefault(); //prevent the form from refreshing the page

    // Attempt to send a POST request to the server to add a new note
    try {
      // Send a POST request to the specified API endpoint
      const response = await fetch(
        "http://localhost:5000/api/notes", 
        {
          method:"POST",
          headers: {
            "Content-Type": "application/json" // Specify that the request body is in JSON format
          },
          // Convert the data to JSON format and send it in the request body
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );
      // Extract the newly created note from the response
      const newNote = await response.json();

      setNotes([newNote, ...notes]); // Add the newly created note to the beginning of the existing notes array
      setTitle(""); //clear the title
      setContent(""); //clear the content

    } catch (e) {
      console.log(e);
    }
  };

  // take whatever they change in the title and content and save it into our state
  const handleUpdateNote = async(event: React.FormEvent) => {
  event.preventDefault();

  // if we don't have a selected note, do nothing
  if(!selectedNote){
    return;
  }

  try {
    // Send a PUT request to the server to update the selected note
    const response = await fetch(
      //we want to add dynamically the ID of the selected note
      `http://localhost:5000/api/notes/${selectedNote.id}`, // URL of the API endpoint, including the selected note's ID
      {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ // Convert the data (title and content) to JSON format and include it in the request body
          title,
          content,
        })
      }
    )

    const updatedNote = await response.json();

    // whatever user edited after they have selected a note and we`ll use map function
    // to create new Array and update that array with our new note object
    // as the map function iterates over the array of notes we`ll check if the id of the note
    // matches the id of the selected note
    const updatedNotesList = notes.map((note) =>
     note.id === selectedNote.id
      ? updatedNote //if id of the note matches the id of the selected note, we`ll update it
      : note //if the id of the note doesn`t match the id of the selected note, we`ll leave it alone
    );

    // once we have updated the array, we`ll update our state
    // resets our form after the form is submitted
    setNotes(updatedNotesList);
    setTitle("");
    setContent("");
    setSelectedNote(null); 

    }catch(e){
      console.log(e)
    }

  };

  //setting the title and content to an empty string when the user cancels
  const handleCancel = () => {
    setTitle("")
    setContent("")
    setSelectedNote(null);
  }

  //this function will delete a note
  const deleteNote = async(event: React.MouseEvent, noteId: number) => {
    //stops the event from interfering the event we added to the note
    //its necessary when you have nested on click events
    event.stopPropagation();

    try {

    await fetch(
      //whenever user clicks delete button for a given note, we pass the Id of that note to our deleteNote function
      // this is where {noteId} comes from
      `http://localhost:5000/api/notes/${noteId}`,
      {
        method: "DELETE",

      }
    )

    // Taking current notes that we've saved and use filter function to remove that note
    // Create a new array of notes by filtering out the note with the specified noteId.
    const updateNotes = notes.filter(
      (note)=> note.id !== noteId
    )

    // Update the state variable notes with the new array updateNotes.
    // This triggers a re-render of the component with the updated notes
    setNotes(updateNotes);

    } catch(e) {

    }
  }

  return (
    <div className="app-container">
      <h1 className="program-title">Note-Nexus</h1>
      <div className="note-form-container">
        <form 
          className="note-form"
          onSubmit={(event) => 
            selectedNote
              ? handleUpdateNote(event)
              : handleAddNote(event)}
        >
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Title"
            required
          ></input>
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Content"
            rows={10}
            required
          ></textarea>
          
          {selectedNote ? (
            <div className="edit-buttons">
              <button type="submit">Save</button>
              <button onClick={handleCancel}> 
                Cancel
              </button>
            </div>
          ) : (
            <button type="submit">Add Note</button>
          )}
        </form>
      </div>
      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-item"
            onClick={() => handleNoteClick(note)}
          >
            <div className="notes-header">
              <button onClick={(event) =>
                deleteNote(event, note.id)
              }
              >
                x
              </button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

//export our component
export default App;