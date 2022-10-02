const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const testUser = {
        username: 'testAdmin',
        password: 'test'
    }

    await api
        .post('/api/users/')
        .send(testUser)
        .set('Content-Type', 'application/json')

    const response = await api
        .post('/api/login/')
        .send(testUser)
        .set('Content-Type', 'application/json')
    helper.token = 'bearer ' + response.body.token

    for (let blog of helper.initialBlogs) {
        await api
            .post('/api/blogs/')
            .send(blog)
            .set('Content-Type', 'application/json')
            .set('Authorization', helper.token)
    }
})

test('blogs are returned as json', async () => {
    const response = await api
        .get('/api/blogs/')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs/')
    const blogs = response.body
    for (const blog of blogs) {
        console.log(blog)
        expect(blog.id).toBeDefined()
    }
})

test('making an HTTP POST request to the /api/blogs url successfully creates a new blog post', async () => {
    const postResponse = await api
        .post('/api/blogs/')
        .send(helper.newBlog)
        .set('Content-Type', 'application/json')
        .set('Authorization', helper.token)
    
    const blogs = await Blog.find({})
    const addedBlog = blogs.find(blog => blog.id === postResponse.body.id)

    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    expect(addedBlog.title).toEqual(helper.newBlog.title)
    expect(addedBlog.author).toEqual(helper.newBlog.author)
    expect(addedBlog.url).toEqual(helper.newBlog.url)
    expect(addedBlog.likes).toEqual(helper.newBlog.likes)

})

test('making an HTTP POST request to /api/blogs/ fails with status 401 Unauthorized if token is missing', async () => {
    await api
        .post('/api/blogs/')
        .send(helper.newBlog)
        .set('Content-Type', 'application/json')
        .expect(401)
})

test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const postResponse = await api
        .post('/api/blogs/')
        .send(helper.newBlogWithoutLikes)
        .set('Content-Type', 'application/json')
        .set('Authorization', helper.token)

    const blogs = await Blog.find({})
    const addedBlog = blogs.find(blog => blog.id === postResponse.body.id)

    expect(addedBlog.likes).toBe(0)
})

test('if title or url are missing, the backend responds with status code 400 Bad Request', async () => {
    await api
        .post('/api/blogs/')
        .send(helper.newBlogWithoutTitle)
        .set('Content-Type', 'application/json')
        .set('Authorization', helper.token)
        .expect(400)

    await api
        .post('/api/blogs/')
        .send(helper.newBlogWithoutUrl)
        .set('Content-Type', 'application/json')
        .set('Authorization', helper.token)
        .expect(400)
})

test('delete a single blog post', async () => {
    const blogs = await Blog.find({})
    
    const exampleBlog = blogs.find(blog => blog.title === 'React patterns')

    console.log(exampleBlog.id)

    await api
        .delete(`/api/blogs/${exampleBlog.id}`)
        .set('Authorization', helper.token)
        .expect(204)
    
    const blogsAfterDelete = await Blog.find({})

    expect(blogsAfterDelete).toHaveLength(helper.initialBlogs.length - 1)
})

test('updating likes of a blog is working', async () => {
    const blogs = await Blog.find({})

    const blogToUpdate = blogs.at(0)

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({likes: 99})

    const blogsAfterUpdate = await Blog.find({})
    
    const blogUpdated = blogsAfterUpdate.at(0)
    expect(blogUpdated.likes).toBe(99)
})

test('creating user succeeds with status 201', async () => {
    const users = await User.find({})
    
    await api
        .post('/api/users/')
        .send({ username: "test", password: "test" })
        .set('Content-Type', 'application/json')
        .expect(201)

    const usersUpdated = await User.find({})
    expect(usersUpdated).toHaveLength(users.length + 1)
})

describe('creating user results in status 400 and error message for', () => {
    test('empty username', async () => {
        const users = await User.find({})
        const response = await api
            .post('/api/users/')
            .send({ username: "", password: "test" })
            .set('Content-Type', 'application/json')
            .expect(400)
        expect(response.error.text).toBe('{"error":"User validation failed: username: Path `username` is required."}')
        const usersUpdated = await User.find({})
        expect(usersUpdated).toHaveLength(users.length)
    })

    test('empty password', async () => {
        const users = await User.find({})
        const response = await api
            .post('/api/users/')
            .send({ username: "test", password: "" })
            .set('Content-Type', 'application/json')
            .expect(400)
        expect(response.error.text).toBe('{"error":"password too short"}')
        const usersUpdated = await User.find({})
        expect(usersUpdated).toHaveLength(users.length)
    })

    test('username too short', async () => {
        const users = await User.find({})
        const response = await api
            .post('/api/users/')
            .send({ username: "te", password: "test" })
            .set('Content-Type', 'application/json')
            .expect(400)
        expect(response.error.text).toBe('{"error":"User validation failed: username: Path `username` (`te`) is shorter than the minimum allowed length (3)."}')
        const usersUpdated = await User.find({})
        expect(usersUpdated).toHaveLength(users.length)
    })    

    test('password too short', async () => {
        const users = await User.find({})
        const response = await api
            .post('/api/users/')
            .send({ username: "test", password: "te" })
            .set('Content-Type', 'application/json')
            .expect(400)
        expect(response.error.text).toBe('{"error":"password too short"}')
        const usersUpdated = await User.find({})
        expect(usersUpdated).toHaveLength(users.length)
    })    

    test('username already used', async () => {
        const users = await User.find({})
        await api
        .post('/api/users/')
        .send({ username: "test", password: "test" })
        .set('Content-Type', 'application/json')
        .expect(201)

        const response = await api
            .post('/api/users/')
            .send({ username: "test", password: "test" })
            .set('Content-Type', 'application/json')
            .expect(400)
        expect(response.error.text).toBe('{"error":"username must be unique"}')
        const usersUpdated = await User.find({})
        expect(usersUpdated).toHaveLength(users.length + 1)
    })    
})

afterAll(() => {
    mongoose.connection.close()
})