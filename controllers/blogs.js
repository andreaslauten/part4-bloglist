const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => { 
    const user = request.user

    if (user) {
        const blog = new Blog(request.body)
        blog.user = user._id
    
        const savedBlog = await blog.save()
    
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
    
        response.status(201).json(savedBlog)
    } else {
        response.status(401).end()
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (user) {
        if (blog) {
            if (blog.user.toString() === user._id.toString()) {
                await Blog.findByIdAndRemove(request.params.id)
                response.status(204).end()
            } else {
                response.status(401).end()
            }
        } else {
            response.status(404).end()
        }
    } else {
        response.status(401).end()
    }



})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }
  
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter