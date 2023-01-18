//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://root:pass@cluster0.wuffgdr.mongodb.net/todolistDB",{useNewUrlParser: true})

const todoSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",todoSchema);

const item1 = new Item({
  name : "Welcome to TodoList"
});
const item2 = new Item({
  name : "Click + to add an Item"
});
const item3 = new Item({
  name : "Select checkbox to delete an Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[todoSchema]
});

const List = mongoose.model('List',listSchema);



// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully saved default items");
//   }
// })

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items");
        }
      })
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
});

app.get("/:customListName",function(req, res){
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name:customListName},function(err, foundList){
    if(err) {
      console.log(err);
    }
    else {
      if(!foundList) {
        console.log(foundList);
        const list = new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        console.log(foundList);
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        // res.redirect("/" + customListName);
      }
    }
  })

  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listName},function(err, foundList) {
      if(!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err) {
        console.log(err);
      }
      else{
        console.log("item deleted");
        res.redirect("/");
      }
    })
  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }


  // traditional method to delete 
  // Item.deleteOne({_id: checkedItemId}, function(err){
    // if(err) {
    //   console.log(err);
    // }
    // else{
    //   console.log("item deleted");
    //   res.redirect("/");
    // }
  // })
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
