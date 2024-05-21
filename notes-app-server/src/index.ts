import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();

//basically parse the body from an API request into Json so we wont have to do it manually
app.use(express.json())
app.use(cors())
const prisma = new PrismaClient();


// we used prisma to get access to the database
// note will be the name of our table
// findMany will return an array of notes
app.get("/api/notes", async (req, res) => {
  
  const notes = await prisma.note.findMany()

  res.json(notes);
})

//create end point for creating a new note
app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body; // get the 'title' and 'content' properties from the request body

  if(!title || !content){
    return res.status(400).send("title and content fields required");
  }

    // catch any errors at the Prisma client throws us 
  try{
    /*call the prisma client, use the create function that exists on Note model to create a new note
    we`ll pass title and the content which we got from request body, so prisma client will return
    a new note and assigned to the 'note' variable */
    const note = await prisma.note.create({
      data: {title, content}
    })
    res.json(note);

  } catch (error){
    res.status(500)
    .send("Opps, something went wrong");
  }

});

//add end point for updating a note
app.put("/api/notes/:id", async (req, res) => {
  const {title, content} = req.body;
  const id = parseInt(req.params.id);

  if(!title || !content){
    return res
      .status(400)
      .send("title and content fields required");
  }



  if(!id || isNaN(id)){
    return res
    .status(400)
    .send("ID must be a valid number");
  }

  try {
    const updateNote = 
      await prisma.note.update({
        where: {id},
        data: {title, content}

      })
      res.json(updateNote);
  } catch(error){
    res
      .status(500)
      .send("oops, something went wrong");
  }
})


  //add end point for deleting a note
  app.delete("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if(!id || isNaN(id)){
      return res
        .status(400)
        .send("ID must be a valid integer");
    }

    try {
      await prisma.note.delete({
        where: {id}
      });
      res.status(204).send(); //204 means no content, which means the request was successful
    } catch (error){
      res.status(500).send("Oops, something went wrong");
    }


  })

// call app.listen , this will essentially start the server whatever port you give it
app.listen(5000, () => {
  console.log("server running on localhost:5000");
})