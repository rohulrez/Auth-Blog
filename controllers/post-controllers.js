const session = require('express-session');
const Post = require('../models/post')
const validationSession = require('../util/validation-session')

getHome = (req, res)=>{
    res.render('welcome', {csrfToken: req.csrfToken()});
};


getAdmin = async (req, res)=> {
    if(!req.session.isAuthenticated) {
        return res.status(401).render('401');
    };   
    
    const posts = await Post.fetchAll();

    sessionErrorData = validationSession.getSessionErrorData(req);

    res.render('admin', { 
    posts: posts,
    inputData: sessionErrorData,
    csrfToken: req.csrfToken(),
   });
};



createPost = async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;


    if(!enteredTitle ||
        !enteredContent||
        enteredTitle === '' ||
        enteredContent === ''
    ) {
        req.session.inputData = {
            hasError: true,
            message: 'invalid input - please check your data.',
            title: enteredTitle,
            content: enteredContent
        }
        res.redirect('/admin');
        return;
    };

    const post = new Post(enteredTitle, enteredContent);
    await post.save();

     res.redirect('/admin')
}


getSinglePost = async (req, res) =>{
    const post = new Post(null ,null, req.params.id);
    await post.fetch();

    if(!post.title || !post.content) {
        res.render('404');
        return;
    }

    sessionErrorData = validationSession.getSessionErrorData(req);

    res.render('single-post', {
        post: post,
        inputData: sessionErrorData,
        csrfToken: req.csrfToken(),
    });
};

updatePost = async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;

    if(!enteredTitle ||
        !enteredContent ||
        enteredTitle === '' ||
        enteredContent === ''
    ) {
        req.session.inputData = {
            hasError: true,
            message: 'Invalid input - please check you data.',
            title: enteredTitle,
            content: enteredContent
        }
        res.redirect(`/posts/${req.params.id}/edit`);
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

