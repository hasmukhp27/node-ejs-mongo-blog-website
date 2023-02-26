//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();

//Setting up MongoDB COnnections and it's values through process envirnment variables. 
const srvURL = process.env.N1_URL;
const dbUser = process.env.N1_KEY;
const dbPasswd = process.env.N1_SECRET;
const dbName = process.env.N1_DB;

mongoose.set("strictQuery", false);

const blogs = [];

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const port = 2935;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const mongoDB = 'mongodb+srv://'+dbUser+':'+dbPasswd+'@'+srvURL+'/'+dbName+'?retryWrites=true&w=majority';

main().catch(err => console.log(err));
async function main() {
    //await mongoose.connect('mongodb://127.0.0.1:27017/test');
    try {
      await mongoose.connect(mongoDB);  //if your database has auth enabled  
    } catch (error) {
      console.log(error);
    }    
}

const blogsSchema = new mongoose.Schema({
        title: {
          type: String,
          required: [true, 'Can\'t have blog without title']
        },
        content: {
          type: String,
          required: [true, 'No blog without Content']
        },
        url: {
          type: String
        }
  });

const Blog = mongoose.model("Blog", blogsSchema);


app.get('/', (req, res) => {

    Blog.find({},(err, foundBlogs)=>{
      if(err){
        console.log(err);
      }
      else{
        if (foundBlogs.length === 0){
          res.redirect("/compose");
        }
        else{
          res.render('home',{homePageInfo: homeStartingContent,posts: foundBlogs});
        }
      }
    });

  
  //console.log("The JSON blog post is --> "+JSON.stringify(blogs));
})


app.get('/about', (req, res) => {
  res.render('about',{aboutPageInfo: aboutContent});
})


app.get('/contact', (req, res) => {
  res.render('contact',{contactPageInfo: contactContent});
})

app.get('/compose', (req, res) => {
  res.render('compose');
})

app.get('/posts/:postId', (req, res)=>{
  //const paramPostId = _.lowerCase(req.params.postId);
  
  /* blogs.forEach(function(post){
    var selectedPostTitle = _.lowerCase(post.blog_title);
    if ( selectedPostTitle === paramPostId ){
      res.render('post',{blogPostTitle: post.blog_title,blogPostContent: post.blog_post});
    }    
  })  */
  const paramPostId = req.params.postId;

  Blog.findOne({url: paramPostId}, (err, foundElement)=>{
      console.log("Found element ->"+foundElement+" for paramId =>"+paramPostId);
      res.render('post',{blogPostTitle: foundElement.title,blogPostContent: foundElement.content});
  });

})

app.post('/compose',(req, res) => {
  blogTitle = req.body.blogTitleText;
  blogPost = req.body.blogPostText;
  blogURL = _.kebabCase(req.body.blogTitleText);
  
  /*   const blog = {
      blog_title: blogTitle,
      blog_post: blogPost,
      blog_URL: blogURL
  }; */

  //blogs.push(blog);

  const blog = new Blog({
    title: blogTitle,
    content: blogPost,
    url: blogURL
  });
  
  blog.save();
  
  res.redirect("/");
  
})

app.listen(port, function() {
  console.log("Hasmukh's Blog App Server started on port "+port);
});
