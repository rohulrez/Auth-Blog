const session = require('express-session');
const Post = require('../models/post')
const validationSession = require('../util/validation-session');
const { post } = require('../routes/blog');
const validation = require('../util/validation');

getHome = (req, res)=>{
    res.render('welcome');
};


getAdmin = async (req, res)=> {
    if(!req.session.isAuthenticated) {
        return res.status(401).render('401');
    };   
    
    const posts = await Post.fetchAll();

    const sessionErrorData = validationSession.getSessionErrorData(req, {
        title: '',
        content: ''
    });

    res.render('admin', { 
    posts: posts,
    inputData: sessionErrorData,
   });
};



createPost = async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;


    if(
        !validation.postIsValid(enteredTitle,enteredContent)
    ) {
        validationSession.flashErrorsToSession(req, {
            message: 'invalid input - please check your data.',
            title: enteredTitle,
            content: enteredContent
        }), ()=> {
            res.redirect('/admin');
        }
        
        return;
    };

    const post = new Post(enteredTitle, enteredContent);
    await post.save();

     res.redirect('/admin')
}

getSinglePost = async (req, res) =>{
    let post = new Post(null , null , req.params.id);
    await post.fetch();


    if(!post.title || !post.content) {
        res.render('404');
        return;
    }
    const sessionErrorData = validationSession.getSessionErrorData(req, { 
        title: post.title, 
        content: post.content
    });

    res.render('single-post', {
        post: post,
        inputData: sessionErrorData,
    });
};

updatePost = async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;

    if(
        !validation.postIsValid(enteredTitle, enteredContent)
    ) {
       validationSession.flashErrorsToSession(req, {
            message: 'Invalid input - please check you data.',
            title: enteredTitle,
            content: enteredContent
        }, 
        () => {res.redirect(`/posts/${req.params.id}/edit`)}
        );

        return;
    };

    const post = new Post (enteredTitle, enteredContent, req.params.id)
    await post.save();

    res.redirect('/admin');
    return;
};


deletePost = async (req, res) =>{
    const post = new Post(null, null, req.params.id)
    await post.delete();
   
   res.redirect('/admin')
   }

module.exports = {
    getHome: getHome,
    getAdmin: getAdmin,
    createPost: createPost,
    getSinglePost: getSinglePost,
    updatePost: updatePost,
    deletePost: deletePost
};

